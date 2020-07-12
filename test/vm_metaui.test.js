const {
  expect
} = require('chai');
const fs = require('fs');
const {
  MetaVM,
  MetaUI,
  ContainerModel,
  SimpleModel
} = require('@saas-plat/metaui');
const {
  VM
} = require('../browser/vm');

class NoneComponent {}

describe('UI环境', () => {

  before(function () {
    this.jsdom = require('jsdom-global')(`<head></head>`, {
      runScripts: "dangerously",
      resources: "usable"
    })

    MetaUI.register({
      view: [NoneComponent, ContainerModel],
      list: [NoneComponent, ContainerModel],
      navbar: [NoneComponent, ContainerModel],
      toolbar: [NoneComponent, ContainerModel],
      buttongroup: [NoneComponent, ContainerModel],
      tree: [NoneComponent, ContainerModel],
      input: [NoneComponent, SimpleModel],
      text: [NoneComponent, SimpleModel],
      table: [NoneComponent, SimpleModel],
      decimal: [NoneComponent, SimpleModel],
      button: [NoneComponent, SimpleModel],
      select: [NoneComponent, SimpleModel],
      refer: [NoneComponent, SimpleModel],
    })
  })

  after(function () {
    this.jsdom()
  })

  it('前端VM从cdn远程加载合并后的js', async () => {
    //const vm = VM('http://localhost:5011');
    const vm = VM('file://' + __dirname + '/jscache');
    const TestView1 = await vm.run('TestView1.js');
    const ApplyOrder = await vm.run('ApplyOrder.js');

    expect(TestView1).to.not.null;
    expect(ApplyOrder).to.not.null;
    // console.log(JSON.stringify(TestView1))
    expect(JSON.parse(JSON.stringify(TestView1))).to.be.eql({
      "root": {
        "key": "buttongroup4",
        "type": "buttongroup",
        "name": "toolbar",
        "items": [{
          "key": "button1",
          "type": "button",
          "text": "Button1",
          "style": "primary"
        }, {
          "key": "button2",
          "type": "button",
          "text": "Button2"
        }, {
          "key": "button3",
          "type": "button",
          "text": "Button3"
        }]
      }
    })

    // console.log(JSON.stringify(ApplyOrder))
    expect(JSON.parse(JSON.stringify(ApplyOrder))).to.be.eql({
      "name": "ApplyOrder",
      "schema": {
        "type": "BaseModel",
        "fields": [{
          "key": "id",
          "type": "SimpleModel",
          "fields": [{
            "key": "lable",
            "type": "string",
            "defValue": "ID",
            "rules": {
              "type": "string"
            }
          }, {
            "key": "default",
            "type": "string"
          }, {
            "key": "dataSouce",
            "type": "string",
            "defValue": "pu.order.id",
            "rules": {
              "type": "string"
            }
          }],
          "rules": {
            "type": "object"
          }
        }, {
          "key": "code",
          "type": "SimpleModel",
          "fields": [{
            "key": "lable",
            "type": "string",
            "defValue": "客户编码",
            "rules": {
              "type": "string"
            }
          }, {
            "key": "default",
            "type": "string"
          }, {
            "key": "dataSouce",
            "type": "string",
            "defValue": "aa.order.code",
            "rules": {
              "type": "string"
            }
          }],
          "rules": {
            "type": "object"
          }
        }, {
          "key": "name",
          "type": "SimpleModel",
          "fields": [{
            "key": "lable",
            "type": "string",
            "defValue": "客户名称",
            "rules": {
              "type": "string"
            }
          }, {
            "key": "default",
            "type": "string"
          }, {
            "key": "dataSouce",
            "type": "string",
            "defValue": "aa.order.name",
            "rules": {
              "type": "string"
            }
          }],
          "rules": {
            "type": "object"
          }
        }, {
          "key": "details",
          "type": "TableModel",
          "fields": [{
            "key": "dataSource",
            "type": "string",
            "defValue": "aa.order.details",
            "rules": {
              "type": "string"
            }
          }, {
            "key": "columns",
            "type": "array",
            "fields": [{
              "key": "key",
              "type": "string"
            }, {
              "key": "title",
              "type": "string"
            }, {
              "key": "field",
              "type": "string"
            }],
            "defValue": [{
              "key": "inventory_name",
              "title": "存货名称",
              "field": "inventory.name"
            }, {
              "key": "inventory_code",
              "title": "存货编码",
              "field": "inventory.code"
            }, {
              "key": "amount",
              "title": "数量",
              "field": "amount"
            }],
            "rules": {
              "type": "array"
            }
          }],
          "rules": {
            "type": "object"
          }
        }, {
          "key": "receivePayments",
          "type": "TableModel",
          "fields": [{
            "key": "dataSource",
            "type": "string",
            "defValue": "arap.receivePayments",
            "rules": {
              "type": "string"
            }
          }, {
            "key": "columns",
            "type": "array",
            "fields": [{
              "key": "key",
              "type": "string"
            }, {
              "key": "title",
              "type": "string"
            }, {
              "key": "field",
              "type": "string"
            }],
            "rules": {
              "type": "array"
            }
          }],
          "rules": {
            "type": "object"
          }
        }, {
          "key": "purchaseArrivals",
          "type": "TableModel",
          "fields": [{
            "key": "dataSource",
            "type": "string",
            "defValue": "pu.arrivals.details",
            "rules": {
              "type": "string"
            }
          }, {
            "key": "columns",
            "type": "array",
            "fields": [{
              "key": "key",
              "type": "string"
            }, {
              "key": "title",
              "type": "string"
            }, {
              "key": "field",
              "type": "string"
            }],
            "rules": {
              "type": "array"
            }
          }],
          "rules": {
            "type": "object"
          }
        }],
        "actions": [{
          "key": "customAction1",
          "type": "function",
          "rules": {
            "type": "function"
          },
          "arguments": []
        }],
        "conflicts": [],
        "mappings": {},
        "references": {},
        "syskeys": []
      }
    })

    const ApplyOrderViewModel = MetaVM.createModel(ApplyOrder.name, ApplyOrder.schema);
    // console.log(JSON.stringify(ApplyOrderViewModel.create()))
    expect(ApplyOrderViewModel.create()).to.not.null;

    const view = MetaUI.create(TestView1, ApplyOrderViewModel.create());
    // console.log(JSON.stringify(view))
    expect(view).to.not.null;
  })

  it('动态加载json运行', async () => {
    const vm = VM('file://' + __dirname + '/jscache');
    const jsonfile = 'model.json';
    const jsonview = 'view.json';
    const model = await vm.run(jsonfile, `
      const { ViewModel } = require('@saas-plat/metaschema');
      module.exports = ViewModel('ViewModel1', ${fs.readFileSync( __dirname + '/jscache/'+jsonfile,'utf8')})
      `);
    const view = await vm.run(jsonview, `
        const { View } = require('@saas-plat/metaschema');
        module.exports = View(${fs.readFileSync( __dirname + '/jscache/'+jsonview,'utf8')})
        `);
      console.log(JSON.stringify(model ))
    // console.log(view)
    expect(model).to.not.null;
    expect(view).to.not.null;

    const ViewModel1 = MetaVM.createModel(model.name, model.schema);
    expect(ViewModel1).to.not.null;

    const View1 = MetaUI.create(view, ViewModel1.create());
    expect(View1).to.not.null;

  })

})
