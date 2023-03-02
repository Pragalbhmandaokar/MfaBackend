class BaseController {
  constructor(opts, name = 'BaseController', serviceName) {
    this.logger = opts.logger;
    this.service = opts[serviceName];
    this.name = name;
  }
}
module.exports = BaseController;
