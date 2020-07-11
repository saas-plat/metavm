const {
  Entity
} = require('@saas-plat/metaschema');
const {
  test
} = require('@saas-plat/metaapi');
// require('lodash')
// process.exit(1)
module.exports = Entity('VM2Action', {
  "Code": "string",
  // 简写
  schemaAction1: (eventData, params) => {
    eventData.Code = params.otherKey1;
    test(eventData)
  },
  // schema类型定义
  schemaAction2: {
    type: 'function',
    handle: function (eventData, params) {
      eventData.Code = params.otherKey2;
    }
  },
  // 字符串数据定义
  schemaAction3: {
    type: 'function',
    arguments: ['eventData','params'],
    handle: ['', 'eventData.Code = params.otherKey3']
  }
})
