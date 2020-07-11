// 浏览器端vm直接在当期上下文通过jsonp加载js执行
const createJSONPCallback = () => {
  global[exports.jsonpCallback] = () => {

  }
}

const register = () => {
  createJSONPCallback();
}

exports.jsonpCallback = 'metavmJsonp';

class Vm {
  // root是文件服务器url
  constructor(sandbox, modules, root) {
    if (!root) {
      throw new Error('Restricted range must be specified');
    }
    this.root = root;
    this.modules = modules || [];
    this.sandbox = sandbox || window;
    register(this.loadModule);
  }

  loadModule = (handle) => {
    handle()
  }

  async run(filename, filecontent) {

  }
}

exports.VM = (root, modules = ['@saas-plat/metaschema', '@saas-plat/metaapi'], sandbox = {}) => {
  return new Vm(sandbox, modules, root);
}
