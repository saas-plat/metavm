# metavm
提供schema脚本的安全运行沙箱

node端隔离实体和查询的用户代码
```js
const vm = VM(codepath);
const EntitySchema = await vm.run('entity.js');

const TestEntity = MetaEntity.createModel(EntitySchema.name, EntitySchema.schema);
....
```

web端隔离视图和视图模型的用户代码
```js
const vm = VM('http://localhost:5011');
const TestView1 = await vm.run('TestView1.js');
const ApplyOrder = await vm.run('ApplyOrder.js');

...
```
