const {
  expect
} = require('chai');
const {VM} = require('../lib/vm');

describe('vm', () => {

  it('vm加载范围限制在jscache和部分modules', async () => {
    const vm = VM(__dirname + '/jscache');
    const ret = (await vm.run('./a.js'))('word')
    expect(ret).to.be.eql('hello word ccc')
  })

})
