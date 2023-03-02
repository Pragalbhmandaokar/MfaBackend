class BaseService {
  constructor(opts, modelName = '') {
    this.logger = opts.logger;
    this.databaseService = opts.databaseService;
    this.modelName = modelName;
  }
}
module.exports = BaseService;
