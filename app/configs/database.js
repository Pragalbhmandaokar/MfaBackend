const serviceLocator = require('../lib/service_locator');
const logger = serviceLocator.get('logger');

class Database {
  constructor() {
    this.sql = serviceLocator.get('sql');
  }

  async _connect() {
    var connection = this.sql
      .createPool({
        connectionLimit: 10,
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'test',
      })
      .on('connected', () => {
        logger.info('Database Connection was Successful');
      })
      .on('error', err => {
        logger.info('failed to connect to database - ', err);
      });
    return connection;
  }

  async _disConnect() {
    this.sql.release();
  }
}

module.exports = new Database();
