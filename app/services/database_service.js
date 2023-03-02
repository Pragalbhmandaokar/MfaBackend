class DatabaseService {
  constructor(opts) {
    this.dbService = opts.mongoService;
  }

  async getById(modelName, id, noErr = false) {
    return await this.dbService.getById(modelName, id, noErr);
  }
}

module.exports = DatabaseService;
