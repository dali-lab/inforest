const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  development: {
    url: `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    dialect: "postgres",
    logging: true,
  },
  test: {
    url: `postgres://${process.env.TEST_DB_NAME}:${process.env.TEST_DB_PASSWORD}@${process.env.TEST_DB_HOST}:${process.env.TEST_DB_PORT}/${process.env.TEST_DB_NAME}`,
    dialect: "postgres",
    logging: false,
  },
  production: {
    url: `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    dialect: "postgres",
    logging: false,
  },
};
