const env = process.env.NODE_ENV || 'development';
const config = require('../../knexfile')[env];
const knex = require('knex');

const params = {
  client: config.client,
  connection: {
    host: config.connection.host,
    user: config.connection.user,
    port: config.connection.port,
    password: config.connection.password,
    database: config.connection.database,
    charset: config.connection.charset,
    ssl: {
      // DO NOT DO THIS
      // set up your ca correctly to trust the connection
      rejectUnauthorized: false,
    },
  },
};

const knexInstance = knex(params);
// knexInstance.on('query', queryData => {
//   console.log(queryData);
// });

module.exports = knexInstance;
