# metavm
提供schema脚本的安全运行沙箱

node端隔离实体和查询的用户代码
需要先把需要运行的用户代码下载到本地codepath文件夹里
```js
const {
  VM
} = require('@saas-plat/metavm');

const vm = VM(codepath);
const EntitySchema = await vm.run('entity.js');

const TestEntity = MetaEntity.createModel(EntitySchema.name, EntitySchema.schema);
....
```

直接运行脚本,支持require的commonjs的调用
```js
const vm = VM(codepath);
const model = await vm.run('BankAccount.js',`
  const { Entity } = require('@saas-plat/metaschema');
  module.exports = Entity('BankAccount',require('./${jsonfile}')) `);
const BankAccount = MetaEntity.createModel(model.name, model.schema);
```

web端隔离视图和视图模型的用户代码
用户代码不用下载,通过http远程加载
```js
const {
  VM
} = require('@saas-plat/metavm');

const vm = VM('http://localhost:5011');
const TestView1 = await vm.run('TestView1.js');
const ApplyOrder = await vm.run('ApplyOrder.js');

...

```

直接运行脚本,但是不能require,前端需要webpack等工具打包不支持按照文件加载
```js
const vm = VM('file://' + __dirname + '/jscache');
const jsonfile = 'model.json';
const jsonview = 'view.json';
const model = await vm.run(jsonfile, `
  const { ViewModel } = require('@saas-plat/metaschema');
  module.exports = ViewModel('ViewModel1', ${fs.readFileSync( __dirname + '/jscache/'+jsonfile,'utf8')})
  `);
```
