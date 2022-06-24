const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  development: {
    url:
      process.env.DATABASE_URL ??
      `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    dialect: "postgres",
    logging: true,
  },
  test: {
    url:
      process.env.DATABASE_URL ??
      `postgres://${process.env.TEST_DB_NAME}:${process.env.TEST_DB_PASS}@${process.env.TEST_DB_HOST}:${process.env.TEST_DB_PORT}/${process.env.TEST_DB_NAME}`,
    dialect: "postgres",
    logging: false,
  },
  production: {
    url:
      process.env.DATABASE_URL ??
      `postgres://${process.env.RDS_USERNAME}:${process.env.RDS_PASSWORD}@${process.env.RDS_HOSTNAME}:${process.env.RDS_PORT}/${process.env.RDS_DB_NAME}`,
    dialect: "postgres",
    logging: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
