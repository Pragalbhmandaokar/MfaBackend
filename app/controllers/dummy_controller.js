const BaseController = require('./base_controller');

class DummyController extends BaseController {
  constructor(opts) {
    super(opts, 'DummyController', 'dummyService');
    this.logger = opts.logger;
  }

  // eslint-disable-next-line no-unused-vars
  async getDummyMessage(parent, args, context) {
    this.logger.debug(`$(this.name) getDummyMessage() called`);
    try {
      const result = await this.service.getDummyMessage(args.id);
      return result;
    } catch (err) {
      this.logger.error(err.message);
      throw new Error(err);
    }
  }
}
module.exports = DummyController;
