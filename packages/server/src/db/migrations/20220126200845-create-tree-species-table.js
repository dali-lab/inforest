"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tree_species", {
      code: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      family: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      genus: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      commonName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
    await queryInterface.addIndex(
      "tree_species",
      {
        name: "taxonomy",
        fields: ["family", "genus"],
      },
      {
        name: "type",
        fields: ["type"],
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("tree_species");
  },
};
