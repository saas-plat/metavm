const {
  NodeVM,
  VMScript
} = require('vm2');
const fs = require('fs');
const path = require('path');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const debug = require('debug')('saas-plat:VM');
const NodeCache = require("node-cache");

const cache = exports.VMCache = new NodeCache({
  stdTTL: process.env.ENTITY_TIMEOUT || 60 * 60, // 1h
  useClones: false,
});
cache.on("expired", function (key, value) {
  debug('%s script expired...', key);
});
cache.on("flush", function () {
  debug('script flush...');
});

class Vm {
  constructor(sandbox, modules, root) {
    if (!root) {
      throw new Error('Restricted range must be specified');
    }
    this.root = root && path.normalize(root);
    const mpath = path.join(process.cwd(), 'node_modules');
    debug('create vm %s,%s...%o %o', mpath, this.root || '', sandbox, modules);
    this._vm = new NodeVM({
      sandbox,
      require: {
        external: {
          modules: modules
        },
        root: [
          // 可以加载modules
          mpath
        ].concat(this.root),
      }
    });
  }

  async compile(filename, filecontent) {
    let script = cache.get(filename);
    if (script) {
      cache.ttl(filename);
      debug('script from cache');
      return script;
    }
    debug('compile %s...', filename);
    // debug(script)
    script = new VMScript(filecontent, filename).compile();
    //debug(script)
    cache.set(filename, script);
    debug('%s script add cache.', filename);
    return script;
  }

  async run(filename, filecontent) {
    const fullpath = path.join(this.root || '', filename);
    debug('run %s...', fullpath);
    const script = await this.compile(fullpath, filecontent || await readFile(fullpath, 'utf8'));
    const module = this._vm.run(script);
    return module.default || module;
  }
}

exports.VM = (root, modules = ['@saas-plat/metaschema', '@saas-plat/metaapi'], sandbox = {
  // 需要让基础类型相等
  String,
  Object,
  Array,
  Number,
  Boolean,
  Date,
  Function,
}) => {
  return new Vm(sandbox, modules, root);
}
