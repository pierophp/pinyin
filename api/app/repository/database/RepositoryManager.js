const mysql = require('mysql2/promise');
const Promise = require('bluebird');
const knex = require('../../services/knex');

const env = process.env.NODE_ENV || 'development';
const config = require('../../../knexfile')[env];

let transaction;
let mysqlConnection;

module.exports = class RepositoryManager {
  static async getTransaction() {
    if (transaction) {
      return transaction;
    }

    return await this.newTransaction();
  }

  static async getMysqlConnection() {
    if (mysqlConnection) {
      return mysqlConnection;
    }

    mysqlConnection = await mysql.createConnection({
      host: config.connection.host,
      user: config.connection.user,
      password: config.connection.password,
      database: config.connection.database,
    });

    return mysqlConnection;
  }

  static async newTransaction() {
    return new Promise(resolve => {
      knex.transaction(t => {
        transaction = t;
        resolve(t);
      });
    });
  }

  static async beginTransaction() {
    return new Promise(resolve => {
      knex.transaction(t => {
        resolve(t);
      });
    });
  }

  static async commit() {
    const trx = await this.getTransaction();
    await trx.commit();
    knex.destroy();
    return await this.newTransaction();
  }

  static async rollBack() {
    const trx = await this.getTransaction();
    await trx.rollback();
    return await this.newTransaction();
  }
};
