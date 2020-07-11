const {
  expect
} = require('chai');
const {
  BaseData,
  MetaEntity,
  EntityCache,
  Repository
} = require('@saas-plat/metadomain');
const {
  VM
} = require('../lib/vm');

describe('业务环境', () => {


  it('隔离运行业务计算环境', async () => {
    const vm = VM(__dirname + '/jscache');
    const model = await vm.run('entity.js');

    const TestSchemaActionObj = MetaEntity.createModel(model.name, model.schema);

    const test = await TestSchemaActionObj.create();
    await test.schemaAction1({
      otherKey1: 'A1000'
    });
    expect(test.Code).to.be.eql('A1000');
    // 这里调用和test.schemaAction2等同
    await test.customAction('schemaAction2', {
      otherKey2: 'B2222'
    });
    expect(test.Code).to.be.eql('B2222');
    await test.schemaAction3({
      otherKey3: 'B2222333'
    });
    expect(test.Code).to.be.eql('B2222333');
  })

  it('动态加载json运行', async () => {
    const vm = VM(__dirname + '/jscache');
    const jsonfile = 'entity.json';
    const model = await vm.run('BankAccount.js',`
      const { Entity } = require('@saas-plat/metaschema');
      module.exports = Entity('BankAccount',require('./${jsonfile}')) `);
    const BankAccount = MetaEntity.createModel(model.name, model.schema);
    expect(await BankAccount.create()).to.not.null;
  })
})
