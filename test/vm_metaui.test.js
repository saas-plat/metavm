const {
  expect
} = require('chai');
const {
  BaseData,
  MetaEntity,
  EntityCache,
  Repository
} = require('@saas-plat/metaui');
const {
  VM
} = require('../browser/vm');

describe('metaui', () => {


  it('隔离运行业务计算环境', async () => {
    const vm = VM(__dirname + '/jscache');
    const model = await vm.run('schema.js');
    await runTest(model);
  })

  it('动态加载json运行', async () => {
    const vm = VM();
    const model = await vm.run('test/BankAccount',`
      const { Entity } = require('@saas-plat/metaschema');
      module.exports = Entity('BankAccount',{
        "Code": {type:"string",mapping:'code'},
        "Name": {type:"string",mapping:'name'},
        "NewBalance": "number"
      }) `);
    const BankAccount = MetaEntity.createModel(model.name, model.schema);
    expect(await BankAccount.create()).to.not.null;
  })
})
