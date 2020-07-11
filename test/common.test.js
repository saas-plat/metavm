const metadomain = require('@saas-plat/metadomain/lib/db');
const metaquery = require('@saas-plat/metaquery/lib/db');
require('i18next').init();
require('@saas-plat/metaapi').register({
  test: (data) => console.log(data)
});

before(async () => {
  await metaquery.connect();
  await metadomain.connect();
})

after(async () => {
  await setTimeout(async () => {
    await metaquery.disconnect();
    await metadomain.disconnect()
  }, 100)
})
