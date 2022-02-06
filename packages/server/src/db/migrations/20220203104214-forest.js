"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("forests", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
      },
      teamId: {
        type: Sequelize.UUID,
        references: {
          model: "team",
          key: "id",
        },
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("forests");
  },
};
