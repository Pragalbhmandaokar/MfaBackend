const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, json } = format;
const httpContext = require('express-http-context');

const createTransports = function (config) {
  const customTransports = [];

  // setup the file transport
  if (config.info_file) {
    customTransports.push(
      new transports.File({
        filename: config.info_file,
        level: 'info',
      })
    );
  }
  if (config.error_file) {
    customTransports.push(
      new transports.File({
        filename: config.error_file,
        level: 'error',
      })
    );
  }

  if (config.debug_file) {
    customTransports.push(
      new transports.File({
        filename: config.debug_file,
        level: 'debug',
      })
    );
  }

  // if config.console is set to true, a console logger will be included.
  if (config.console) {
    customTransports.push(
      new transports.Console({
        level: 'debug',
      })
    );
  }

  return customTransports;
};

const reqIdFormat = format(info => {
  const reqId = httpContext.get('req_id');
  const wid = httpContext.get('wid');

  if (reqId) {
    info['req_id'] = reqId;
  }

  if (wid) {
    info['wid'] = wid;
  }

  return info;
});

module.exports = {
  create(config) {
    return new createLogger({
      transports: createTransports(config),
      format: combine(
        label({ label: 'API' }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        reqIdFormat(),
        json()
      ),
    });
  },
};
