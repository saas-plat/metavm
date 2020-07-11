const {
  DataTable,
  Types
} = require('@saas-plat/metaschema');

module.exports = DataTable('VMDataTable1', {
  Code: {
    type: String,
    mapping: 'code'
  },
  Name: {
    type: String,
    mapping: 'name'
  },
  NewBalance: Number,
  Other: Types.Mixed,
  Date1: Date,
  Boolean1: Boolean,
  Array1: {
    type: Array,
    fields: {
      sub: Types.String
    }
  },
  Object1: {
    type: Object,
    fields: {
      sub: Types.String
    }
  },
  // ------------ actions -----------------
  findObjs: {
    type: 'function',
    handle: async function () {
      // 不能用箭头函数
      return await this.find({});
    }
  }
})
