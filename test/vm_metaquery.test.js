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

describe('查询环境', () => {

  it('隔离运行数据查询环境', async () => {
    const vm = VM(__dirname + '/jscache');
    const model = await vm.run('table.js');
    //  console.log(JSON.stringify(model));

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
    const vm = VM(__dirname + '/jscache');
    const jsonfile = 'table.json';
    const model = await vm.run('BankAccountTable.js', `
      const { DataTable } = require('@saas-plat/metaschema');
      module.exports = DataTable('BankAccountTable',require('./${jsonfile}')) `);

    //  console.log(JSON.stringify(model));


    const BankAccountTable = MetaTable.createModel(model.name, model.schema);
    expect(BankAccountTable).to.not.null;

  })
})
