module.exports = {
  app: {
    name: process.env.APP_NAME,
    port: process.env.APP_PORT || 5000,
  },
  mongo: {
    type: process.env.DB_TYPE,
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    name: process.env.DB_NAME,
    dburi: process.env.DB_URI,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
  },
  application_logging: {
    info_file: process.env.INFO_LOG_PATH || 'logs/info.log',
    error_file: process.env.ERROR_LOG_PATH || 'logs/error.log',
    debug_file: process.env.DEBUG_LOG_PATH || 'logs/debug.log',
    console: process.env.LOG_ENABLE_CONSOLE || true,
  },
};
