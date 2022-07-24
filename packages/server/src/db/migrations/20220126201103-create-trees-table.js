"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("trees", {
      tag: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      plotNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "plots",
          key: "number",
        },
      },
      latitude: {
        type: Sequelize.FLOAT,
      },
      longitude: {
        type: Sequelize.FLOAT,
      },
      plotX: {
        type: Sequelize.FLOAT,
      },
      plotY: {
        type: Sequelize.FLOAT,
      },
      dbh: {
        type: Sequelize.FLOAT,
      },
      speciesCode: {
        type: Sequelize.STRING,
        references: {
          model: "tree_species",
          key: "code",
        },
      },
      statusName: {
        type: Sequelize.STRING,
        references: {
          model: "tree_statuses",
          key: "name",
        },
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
      "trees",
      {
        name: "asolute_position",
        fields: ["latitude", "longitude"],
      },
      {
        name: "relative_position",
        fields: ["plotX", "plotY"],
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("trees");
  },
};
