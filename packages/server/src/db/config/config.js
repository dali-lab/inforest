module.exports = {
  development: {
    database: "ong_forestry_dev",
    username: "postgres",
    password: "password",
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: true,
  },
  test: {
    database: "ong_forestry_test",
    username: "postgres",
    password: "password",
    host: process.env.TEST_DB_HOST,
    dialect: "postgres",
    logging: false,
  },
  production: {
    database: "ong_forestry_prod",
    username: "postgres",
    password: "password",
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
  },
};
