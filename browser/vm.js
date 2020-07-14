// 浏览器端vm直接在当期上下文通过jsonp加载js执行
const debug = require('debug')('saas-plat:VM');
let callbackKey;

exports.jsonpCallbackTimeout = process.env.JSONP_TIMEOUT || 60000;
exports.jsonpCallback = process.env.JSONP_CALLBACK || 'metavmJsonp';
const jsonpFns = {};

function jsonp(key, url, text) {
  return new Promise((resolve, reject) => {
    const sc = document.querySelector(`script[src="${url}"]`);
    if (sc) {
      resolve(jsonpGetModule(key));
      return;
    }
    let timer;
    let script;

    function cleanup() {
      if (script.parentNode) script.parentNode.removeChild(script);
      if (timer) clearTimeout(timer);
    }
    timer = setTimeout(function () {
      cleanup();
      reject(new Error('fetch ' + url + ' timeout!'));
    }, exports.jsonpCallbackTimeout);
    // create script
    script = document.createElement('script');
    //script.setAttribute('async', 'true');
    if (text) {
      script.text = text;
    } else {
      debug('jsonp req %s...', url);
      script.src = url;
    }
    script.onload = function () {
      cleanup();
      resolve(jsonpGetModule(key));
    }
    script.onerror = function (event) {
      cleanup();
      reject(event);
    }
    document.head.appendChild(script);
  });
}

function jsonpGetModule(key) {
  debug('find jsonp callback...', key);
  return jsonpFns[key];
}

function jsonpCallbackHandle(key, fn) {
  debug('jsonp callback...', key);
  jsonpFns[key] = fn;
}

function createJSONPCallback() {
  if (!window[exports.jsonpCallback]) {
    if (window[callbackKey]) {
      delete window[callbackKey];
    }
    callbackKey = exports.jsonpCallback;
    window[callbackKey] = jsonpCallbackHandle;
    debug('jsonp callback install...', callbackKey);
  }
}

/*
 * With the above plugin, this function will get called just
 * before the script element is added to the DOM. It is passed
 * the script element object and should return either the same
 * script element object or a replacement (which is what we do
 * here).
 */
const dynamicImportScriptHook = (headers, script, dynamicPublicPath = '') => {
  const {
    onerror,
    onload
  } = script;
  var emptyScript = document.createElement('script');
  /*
   * Here is the fetch(). You can control the fetch as needed,
   * add request headers, etc. We wrap webpack's original
   * onerror and onload handlers so that we can clean up the
   * object URL.
   *
   * Note that you'll probably want to handle errors from fetch()
   * in some way (invoke webpack's onerror or some such).
   */
  fetch(dynamicPublicPath + script.src, {
      headers
    })
    .then(response => response.blob())
    .then(blob => {
      script.src = URL.createObjectURL(blob);
      script.onerror = (event) => {
        URL.revokeObjectURL(script.src);
        onerror(event);
      };
      script.onload = (event) => {
        URL.revokeObjectURL(script.src);
        onload(event);
      };
      emptyScript.remove();
      document.head.appendChild(script);
    });
  /* Here we return an empty script element back to webpack.
   * webpack will add this to document.head immediately.  We
   * can't let webpack add the real script object because the
   * fetch isn't done yet. We add it ourselves above after
   * the fetch is done.
   */
  return emptyScript;
};

// https://www.barretlee.com/blog/2016/08/23/javascript-sandbox/
// 1. code 中可以提前关闭 sandbox 的 with 语境，如 '} alert(this); {'；
//    是不存在的,webpack编译语法检查不过
// 2. code 中可以使用 eval 和 new Function 直接逃逸
//   采用le webpack编译时检查eval 和 new Function报错
function createSandbox(sandbox) {
  //使用 proxy 对访问做拦截处理，sandbox 本不存在的属性会追溯到全局变量上访问
  const proxy = new Proxy(sandbox, {
    has(target, key) {
      return true; // 欺骗，告知属性存在
    },
    get(target, key, receiver) {
      // Symbol.unscopables 的设定，声明 foo 属性在 是不存在的，从而使得代码从 with 中逃逸
      // 加固，防止逃逸
      if (key === Symbol.unscopables) {
        return undefined;
      }
      return Reflect.get(target, key, receiver);
    }
  });
  debug('create sandbox...');
  return proxy;
}

class Vm {
  // root是文件服务器url
  constructor(sandbox, modules, root) {
    if (!root) {
      throw new Error('Restricted range must be specified');
    }
    root = root.replace(/\\/g, '/');
    this.root = root.endsWith('/') ? root : root + '/';
    this.modules = modules || [];
    const {
      headers,
      ...other
    } = sandbox;
    const sandobj = {
      console,
      setTimeout,
      setInterval,
      setImmediate,
      clearTimeout,
      clearInterval,
      clearImmediate,
      String,
      Number,
      Buffer,
      Boolean,
      Array,
      Date,
      Error,
      EvalError,
      RangeError,
      ReferenceError,
      SyntaxError,
      TypeError,
      URIError,
      RegExp,
      Function,
      Object,
      Proxy,
      Reflect,
      Map,
      WeakMap,
      Set,
      WeakSet,
      Promise,
      Symbol,
      Math,
      require: moduleName => this.require(moduleName),
      // 动态注入校验信息在加载script时
      dynamicImportScriptHook: headers ? dynamicImportScriptHook.bind(headers) : null,
      ...other,
    };
    Object.keys(sandobj).forEach(key => {
      Object.defineProperties(sandobj, {
        [key]: {
          value: sandobj[key]
        }
      })
    })
    this.sandbox = createSandbox(sandobj);
    createJSONPCallback();
  }

  require(moduleName) {
    debug('vm require...', moduleName);
    // 浏览器采用webpack打包方式处理系统包,不能加载相对文件
    // if (/^(\.|\.\/|\.\.\/)/.exec(moduleName)) {
    //   // Module is relative file, e.g. ./script.js or ../script.js
    // } else
    if (!this.modules.some(id => id === moduleName)) {
      throw new Error(`The module '${moduleName}' is not whitelisted in VM.`);
    }
    return require(moduleName);
  }

  async run(filename, filecontent) {
    let runSandbox;
    const fullpath = this.root + filename.replace(/\\/g, '/');
    if (filecontent) {
      //debug(`with (sandbox) {\n${filecontent}\n}`)
      // dynamicImportScriptHook 支持dynamicPublicPath
      runSandbox = new Function('sandbox', `with (sandbox) {\n var scope={dynamicPublicPath:'${fullpath}'};\n with(scope){\n${filecontent}\n}\n}`);
    } else {
      // key就是去掉扩展名的文件名  xxx.tag.js chunk.hash.js
      let key = filename.substr(0, filename.lastIndexOf('.'));
      if (!key) {
        throw new Error('key not exist!', filename);
      }
      runSandbox = await jsonp(key, fullpath);
    }
    debug('vm run in sandbox...');
    this.sandbox.module = {};
    // dynamicImportScriptHook 支持dynamicPublicPath
    this.sandbox.dynamicPublicPath = fullpath;
    runSandbox(this.sandbox);
    const module = this.sandbox.module.exports;
    delete this.sandbox.module;
    return module.default || module;
  }
}

exports.VM = (root, modules = ['@saas-plat/metaschema', '@saas-plat/metaapi'], sandbox = {}) => {
  return new Vm(sandbox, modules, root);
}
