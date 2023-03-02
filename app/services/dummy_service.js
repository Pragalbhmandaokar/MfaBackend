const BaseService = require('./base_service');

class DummyService extends BaseService {
  constructor(opts) {
    super(opts, 'Dummy');
  }

  async getDummyMessage(id) {
    const result = await this.databaseService.getById(this.modelName, id);
    if (!result) {
      // eslint-disable-next-line no-console
      console.log('error');
    }

    this.logger.info(`${this.modelName} fetched successfully`);
    return result;
  }
}
module.exports = DummyService;
