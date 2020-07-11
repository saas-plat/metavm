// const wait =  (timeout = 0) => {
//   console.log('waiting...', timeout);
//   return new Promise(resolve => {
//     setTimeout(resolve, timeout);
//   })
// }

module.exports =  function (who) {
  //await wait(10);
  const b = require('./b');
  return 'hello ' + who + ' ' + b()
}
