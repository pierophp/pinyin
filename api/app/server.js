require('ts-node/register');
const app = require('./index');

const port = 'PORT' in process.env ? process.env.PORT : 9090;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Pinyin app listening on port ${port}`);
});
