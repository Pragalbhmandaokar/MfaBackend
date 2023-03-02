'use strict';

/**
 * Parent Service Class to reduce duplication of code
 *
 */
class MongoService {
  /**
   * initialize dependencies
   */
  constructor(opts) {
    this.mongoose = opts.mongoose;
    this.name = 'Mongo Service:';
    this.log = opts.logger;

    this.modelNameToIdPrefix = {
      User: 'USR',
      CreatorCampaign: 'CMP',
      CreatorProfile: 'CPR',
      Coin: 'COIN',
      CreatorDiscord: 'DIS',
      DiscordRole: 'DROL',
      Wallet: 'WAL',
      Transaction: 'TRA',
      SocialLink: 'SLNK',
      Nft: 'NFT',
      UserToNft: 'UTN',
      NftUtility: 'NFTU',
    };
  }

  /**
   * get model instance
   * @param modelName model instance to grab
   * @returns model instance
   */
  getModelInstance(modelName) {
    return this.mongoose.model(modelName);
  }

  /**
   * Get documents by query
   * @param modelName mongoose model's name to query data from
   * @param query mongo query to execute
   * @param sortOption {field: sorting order} e.g. {name: 1} 1 for ascending and -1 for descending
   * @returns resulting object from query
   * @error NotFoundError
   */
  async getByQuery(modelName, query, projections = null, sortOption = {}) {
    // initialise model
    const model = this.getModelInstance(modelName);
    const result = await model
      .find(query, projections)
      .sort(sortOption) // sorts the data
      .lean();
    this.log.info(`${this.name} ${modelName} items fetched successfully`);
    return result;
  }

  /**
   * Get documents by query
   * @param modelName mongoose model's name to query data from
   * @param query mongo query to execute
   * @param projections
   * @param sortOption {field: sorting order} e.g. {name: 1} 1 for ascending and -1 for descending
   * @param page document to be skiped
   * @param limit max number of documents to be fetched
   * @returns resulting object from query
   * @error NotFoundError
   */
  async getByQueryWithPagination(
    modelName,
    query,
    projections,
    sortOption,
    page,
    limit
  ) {
    if (page < 0 || limit < 0) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} Page or Limit cannot be negative`
      );
      throw err;
    }
    // initialise model
    const model = this.getModelInstance(modelName);
    const result = await model
      .find(query, projections)
      .sort(sortOption)
      .skip(page * limit)
      .limit(limit) // sorts the data
      .lean();

    if (!result) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} No ${modelName} items found`
      );
      throw err;
    }

    this.log.info(`${this.name} ${modelName} items fetched successfully`);
    return result;
  }
  /**
   * Get sum of a keys-value for grouped docs by another key
   * @param modelName mongoose model's name
   * @param aggregationPipe an array of stages
   * @returns resulting object from query
   */
  async aggregate(modelName, aggregationPipe = []) {
    const model = this.getModelInstance(modelName);
    let result;
    result = await model.aggregate(aggregationPipe);
    this.log.info(`${this.name} ${modelName} items fetched successfully`);
    return result;
  }

  /**
   * @description Populate records with reference model
   * @param refModelName mongoose model's name to query data from
   * @param records records to be updated
   * @returns resulting updated documents
   */
  async populate(refModelName, records, options) {
    const model = this.getModelInstance(refModelName);
    const result = await model.populate(records, options);
    this.log.info(`records with ${refModelName} reference model`);
    return result;
  }

  /**
   * Get documents by query
   * @param modelName mongoose model's name to query data from
   * @param query mongo query to execute
   * @param noErr flag for not throw error
   * @returns resulting object from query
   * @error NotFoundError
   */
  async getOneByQuery(modelName, query, noErr, projections = null) {
    // initialise model
    const model = this.getModelInstance(modelName);

    const result = await model.findOne(query, projections).lean();

    if (!result && !noErr) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} No ${modelName} items found`
      );
      throw err;
    }

    this.log.info(`${this.name} ${modelName} item fetched successfully`);
    return result;
  }

  /**
   * insert multiple documents
   * @param modelName mongoose model's name
   * @param newObjects new documents to be inserted
   * @param skipUId flag to skip uid generation
   * @returns none
   */
  async insertMany(modelName, newObjects, skipUId = false) {
    const model = this.getModelInstance(modelName);
    let counter = 0;
    let insertRecs = [];
    let result = [];
    for (let newObject of newObjects) {
      if (!skipUId) {
        newObject._id = await this.uIdGen.getId(
          this.modelNameToIdPrefix[modelName]
        );
      }
      insertRecs.push(newObject);
      ++counter;
      if (counter === this.constants.BATCH_SIZE) {
        const res = await model.insertMany(insertRecs);
        result = [...result, ...res];
        counter = 0;
        insertRecs = [];
      }
    }
    if (counter > 0) {
      const res = await model.insertMany(insertRecs);
      result = [...result, ...res];
      counter = 0;
      insertRecs = [];
    }
    this.log.info(
      `${this.name} ${modelName} many entries inserted successfully`
    );
    return result;
  }

  /**
   * Get Count of documents by query
   * @param modelName mongoose model's name to query data from
   * @param query mongo query to execute
   * @returns resulting count of object from query
   */
  async getCount(modelName, query) {
    // initialise model
    const model = this.getModelInstance(modelName);
    const result = await model.find(query).count();
    this.log.info(`${this.name} ${modelName} items fetched successfully`);
    return result;
  }

  /**
   * Get documents by id
   * @param modelName mongoose model's name to query data from
   * @param id id to look for
   * @param noErr boolean to not throw error
   * @returns resulting object from query
   * @error NotFoundError
   */
  async getById(modelName, id, noErr) {
    const model = this.getModelInstance(modelName);
    const result = await model.findById(id).lean();

    if (!result && !noErr) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} ${modelName} item with id - ${id} could not be found`
      );
      throw err;
    }
    this.log.info(
      `${this.name} ${modelName} item with id - ${id} fetched successfully`
    );

    return result;
  }

  /**
   * Create a document
   * @param modelName mongoose model's name to create
   * @param newObject json object to create the new document with
   * @param skipUId flag to skip uid generation
   * @returns newly created Object
   */
  async create(modelName, newObject, skipUId = false) {
    const model = this.getModelInstance(modelName);
    let newObjectInstance = new model(newObject);

    if (!skipUId) {
      newObjectInstance._id = await this.uIdGen.getId(
        this.modelNameToIdPrefix[modelName]
      );
    }

    newObjectInstance = await newObjectInstance.save();
    this.log.info(`${this.name} ${modelName} created successfully`);
    return newObjectInstance;
  }

  /**
   * update an existing document
   * @param modelName mongoose model's name to update
   * @param id object to be updated
   * @param updateObject json object to update the new document to
   * @returns updated object
   */
  async update(modelName, id, updateObject) {
    const model = this.getModelInstance(modelName);
    const updatedObjectInstance = await model
      .findOneAndUpdate({ _id: id }, updateObject, { new: true })
      .lean();
    if (!updatedObjectInstance) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} ${modelName} item with ${id} could not be updated`
      );
      throw err;
    }
    this.log.info(
      `${this.name} ${modelName} item with id: ${id} updated successfully`
    );
    return updatedObjectInstance;
  }

  /**
   * updateOne an existing document
   * @param modelName mongoose model's name to update
   * @param query query
   * @param updateObject json object to update the new document to
   * @returns updated object
   */
  async updateOne(modelName, query, updateObject, throwError) {
    const model = this.getModelInstance(modelName);
    const result = await model
      .findOneAndUpdate(query, updateObject, { new: true })
      .lean();

    if (!result && throwError) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} ${modelName} items could not be updated`
      );
      throw err;
    }

    this.log.info(`${this.name} ${modelName} items updated successfully`);
    return result;
  }

  /**
   * update an existing document
   * @param modelName mongoose model's name to update
   * @param query query
   * @param updateObject json object to update the new document to
   * @returns updated object
   */
  async updateMany(modelName, query, updateObject) {
    const model = this.getModelInstance(modelName);
    const result = await model.updateMany(query, updateObject);

    if (!result) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} ${modelName} items could not be updated`
      );
      throw err;
    }

    this.log.info(`${this.name} ${modelName} items updated successfully`);
    return result;
  }

  /**
   * delete an existing document
   * @param modelName mongoose model's name to delete
   * @param id object to be deleted
   * @returns none
   */
  async delete(modelName, id) {
    const model = this.getModelInstance(modelName);
    const deletedObjectInstance = await model.findOneAndRemove({ _id: id });
    if (!deletedObjectInstance) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} ${modelName} item with id: ${id} could not be deleted`
      );
      throw err;
    }
    this.log.info(
      `${this.name} ${modelName} item with id: ${id} deleted successfully`
    );
    return { id };
  }

  /**
   * delete multiple documents
   * @param modelName mongoose model's name
   * @param query query to delete many with
   * @returns none
   */
  async deleteMany(modelName, query) {
    const model = this.getModelInstance(modelName);
    this.log.info(`${this.name} inside DeleteMany`);
    try {
      await model.deleteMany(query);
    } catch (err) {
      this.log.error(`${this.name} Error Encountered in deleteMany`);
      throw err;
    }
  }

  /**
   * delete an existing document
   * @param modelName mongoose model's name to delete
   * @param query
   * @returns none
   */
  async findAndDelete(modelName, query) {
    const model = this.getModelInstance(modelName);
    const deletedObjectInstance = await model.findOneAndRemove(query);

    if (!deletedObjectInstance) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} ${modelName} item  could not be deleted`
      );
      throw err;
    }

    this.log.info(`${this.name} ${modelName} item deleted successfully`);
    return deletedObjectInstance;
  }

  /**
   * find by id and update the document
   * @param modelName mongoose model's name to update
   * @param id object to be updated
   * @param updateObject json object to update the new document to
   * @param opts options
   * @returns updated object
   */
  async findByIdAndUpdate(
    modelName,
    id,
    updateObject,
    noErr = false,
    opts = {}
  ) {
    let options = { new: true };
    options = { ...options, ...opts };
    const model = this.getModelInstance(modelName);
    const updatedObjectInstance = await model.findByIdAndUpdate(
      id,
      updateObject,
      options
    );

    if (!updatedObjectInstance && !noErr) {
      const err = this.errs(
        this.httpStatus.NOT_FOUND,
        `${this.name} ${modelName} item with ${id} could not be updated`
      );
      throw err;
    }

    this.log.info(
      `${this.name} ${modelName} item with id: ${id} updated successfully`
    );

    return updatedObjectInstance;
  }
}

module.exports = MongoService;
