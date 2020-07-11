const {
  expect
} = require('chai');
const {
  MetaTable
} = require('@saas-plat/metaquery');
const {
  VM
} = require('../lib/vm');
const mongoose = require('mongoose');

describe('metaquery', () => {

  it('隔离运行数据查询环境', async () => {
    const vm = VM(__dirname + '/jscache');
    const model = await vm.run('table.js');
    //  console.log(JSON.stringify(model));
    // 这里需要验证一下jsschema的系统类型是否相等
    expect(JSON.parse(JSON.stringify(model))).to.be.eql({
      "name": "VMDataTable1",
      "schema": {
        "type": "DataTable",
        "fields": [{
          "key": "Code",
          "type": "string",
          "rules": {
            "type": "string"
          },
          "mapping": "code"
        }, {
          "key": "Name",
          "type": "string",
          "rules": {
            "type": "string"
          },
          "mapping": "name"
        }, {
          "key": "NewBalance",
          "type": "number"
        }, {
          "key": "Other",
          "type": "mixed"
        }, {
          "key": "Date1",
          "type": "date"
        }, {
          "key": "Boolean1",
          "type": "boolean"
        }, {
          "key": "Array1",
          "type": "array",
          "fields": [{
            "key": "sub",
            "type": "string"
          }],
          "rules": {
            "type": "array"
          }
        }, {
          "key": "Object1",
          "type": "object",
          "fields": [{
            "key": "sub",
            "type": "string"
          }],
          "rules": {
            "type": "object"
          }
        }, {
          "key": "id",
          "type": "string"
        }, {
          "key": "ts",
          "type": "string"
        }],
        "actions": [{
          "key": "findObjs",
          "type": "function",
          "rules": {
            "type": "function"
          },
          "arguments": []
        }],
        "conflicts": [],
        "mappings": {
          "code": "Code",
          "name": "Name"
        },
        "references": {},
        "syskeys": ["_id", "_ns"]
      }
    })

    await mongoose.connection.db.collection('VMDataTable1.tables').deleteMany();
    const VMDataTable1 = MetaTable.createModel(model.name, model.schema);

    const vm1 = await new VMDataTable1({
      Name: 'aaaaa',
    });
    await vm1.save();
    const ret = await VMDataTable1.findObjs();
    //console.log(ret)
    expect(ret[0].Name).to.be.eql('aaaaa')
  })

  it('动态加载json运行', async () => {
    const vm = VM();
    const model = await vm.run('test/BankAccountTable', `
      const { DataTable } = require('@saas-plat/metaschema');
      module.exports = DataTable('BankAccountTable',{
        "id": "string",
        "Code": "string",
        "Str1": {
          type: 'string',
          description: '这是一个字符串'
        },
        "Date": "date",
        "Value": {
          type: 'number',
        },
        "Bool1": 'boolean', // 布尔
        "Ref": 'mixed',
        "Obj1": { // 对象类型
          "Code": "string",
          "Name": "string"
        },
        'Details': [{ // 子表
          "Value": "number",
          "REF2": {
            "id": "string",
            "Code": "string",
            "Name": "string"
          }
        }]
      }) `);

    //  console.log(JSON.stringify(model));
    // 这里需要验证一下json的系统类型是否相等
    expect(JSON.parse(JSON.stringify(model))).to.be.eql({
      "name": "BankAccountTable",
      "schema": {
        "type": "DataTable",
        "fields": [{
          "key": "id",
          "type": "string"
        }, {
          "key": "Code",
          "type": "string"
        }, {
          "key": "Str1",
          "type": "string",
          "rules": {
            "type": "string"
          },
          "description": "这是一个字符串"
        }, {
          "key": "Date",
          "type": "date"
        }, {
          "key": "Value",
          "type": "number",
          "rules": {
            "type": "number"
          }
        }, {
          "key": "Bool1",
          "type": "boolean"
        }, {
          "key": "Ref",
          "type": "mixed"
        }, {
          "key": "Obj1",
          "type": "object",
          "fields": [{
            "key": "Code",
            "type": "string"
          }, {
            "key": "Name",
            "type": "string"
          }]
        }, {
          "key": "Details",
          "type": "array",
          "subtype": "object",
          "fields": [{
            "key": "Value",
            "type": "number"
          }, {
            "key": "REF2",
            "type": "object",
            "fields": [{
              "key": "id",
              "type": "string"
            }, {
              "key": "Code",
              "type": "string"
            }, {
              "key": "Name",
              "type": "string"
            }]
          }]
        }, {
          "key": "ts",
          "type": "string"
        }],
        "actions": [],
        "conflicts": [],
        "mappings": {
          "id": "id"
        },
        "references": {},
        "syskeys": ["_id", "_ns"]
      }
    })

    const BankAccountTable = MetaTable.createModel(model.name, model.schema);
    expect(BankAccountTable).to.not.null;

  })
})
