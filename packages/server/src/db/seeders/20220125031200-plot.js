"use strict";

const uuid = require("uuid4");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("plots", [
      {
        id: uuid(),
        name: "Plot 1",
        lat: -37.8136,
        long: 164.9631,
        length: 20,
        width: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        name: "Plot 2",
        lat: -23.5156,
        long: 114.4031,
        length: 20,
        width: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    queryInterface.bulkDelete("plots", null, {});
  },
};
