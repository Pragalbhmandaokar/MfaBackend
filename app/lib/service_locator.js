const awilix = require('awilix');
const configs = require('../configs/configs');
const logger = require('./logger').create(configs.application_logging);

function ServiceLocator() {
  this.container = awilix.createContainer();
  this.register();
}

ServiceLocator.prototype.register = function () {
  this.container
    .loadModules(['./app/controllers/*.js'], {
      formatName: 'camelCase',
      resolverOptions: {
        lifetime: awilix.Lifetime.SINGLETON,
        register: awilix.asClass,
      },
    })
    .register({
      logger: awilix.asValue(logger),
    })

    .register({
      sql: awilix.asValue(require('mysql2')),
    })
    .register({
      path: awilix.asValue(require('path')),
    })
    .register({
      fs: awilix.asValue(require('fs')),
    })
    .register({
      configs: awilix.asValue(configs),
    });
};
ServiceLocator.prototype.get = function (dependencyName) {
  try {
    return this.container.resolve(dependencyName);
  } catch (err) {
    logger.error(err.message);
    throw err;
  }
};
module.exports = new ServiceLocator();
