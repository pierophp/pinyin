const env = require('./env.js');

module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env['DATABASE_HOST'] ?? env.database_host,
      database: process.env['DATABASE_NAME'] ?? env.database_name,
      user: process.env['DATABASE_USER'] ?? env.database_user,
      password: process.env['DATABASE_PASS'] ?? env.database_pass,
      charset: 'utf8mb4',
      port: process.env['DATABASE_PORT'] ?? env.database_port ?? '3306',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'migrations',
    },
  },

  staging: {
    client: 'mysql2',
    connection: {
      host: '127.0.0.1',
      database: 'pinyin',
      user: 'root',
      password: null,
      charset: 'utf8mb4',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'migrations',
    },
  },

  production: {
    client: 'mysql2',
    connection: {
      host: env.database_host,
      database: env.database_name,
      user: env.database_user,
      password: env.database_pass,
      charset: 'utf8mb4',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'migrations',
    },
  },
};
