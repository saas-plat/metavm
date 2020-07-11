const {
  expect
} = require('chai');
const http = require('http');
const path = require('path');
const fs = require('fs');
const urlparser = require('url');
const querystring = require('querystring');
const {
  MetaVM,
  MetaUI
} = require('@saas-plat/metaui');
const {
  VM
} = require('../browser/vm');

describe('UI环境', () => {

  let mockServer;
  before(done => {
    mockServer = http.createServer((request, response) => {
      const url = urlparser.parse(request.url);
      const filename = __dirname + '/jscache' + url.pathname;
      if (!fs.exists(filename)) {
        console.error(request.url)
        response.statusCode = 404;
      } else {
        response.write(JSON.stringify(data));
      }
      response.end();
    });
    mockServer.listen(5011, done);
  })

  after(() => {
    mockServer.close();
  })

  it('前端VM从cdn远程加载合并后的js', async () => {
    const vm = VM('http://localhost:5011');
    const view = await vm.run('view.js');
    const model = await vm.run('model.js');

    expect(view).to.not.null;
    expect(model).to.not.null;

    const ViewModel1 = MetaVM.createModel(model.name, model.schema);
    expect(ViewModel1).to.be.eql();

    const View1 = MetaUI.create(view, ViewModel1);
    expect(View1).to.be.eql();
  })

  it('动态加载json运行', async () => {
    const vm = VM('http://localhost:5011');
    const jsonfile = 'model.json';
    const jsonview = 'view.json';
    const model = await vm.run('VM1.js', `
      const { ViewModel } = require('@saas-plat/metaschema');
      module.exports = ViewModel('ViewModel1', require('./${jsonfile}')) `);
    const view = await vm.run('V1.js', `
        const { View } = require('@saas-plat/metaschema');
        module.exports = View('View1', require('./${jsonview}')) `);

    const ViewModel1 = MetaVM.createModel(model.name, model.schema);
    expect(ViewModel1).to.not.null;

    const View1 = MetaUI.create(view, ViewModel1);
    expect(View1).to.not.null;

  })

})
