module.exports = {
  development: {
    database: "forestree_dev",
    username: "postgres",
    password: "password",
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: true,
  },
  test: {
    database: "forestree_test",
    username: "postgres",
    password: "password",
    host: process.env.TEST_DB_HOST,
    dialect: "postgres",
    logging: false,
  },
  production: {
    database: "forestree_prod",
    username: "postgres",
    password: "password",
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
  },
};
