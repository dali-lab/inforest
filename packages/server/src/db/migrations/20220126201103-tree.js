"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("trees", {
      tag: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      plotId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "plots",
          key: "id",
        },
      },
      lat: {
        type: Sequelize.FLOAT,
      },
      long: {
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
      height: {
        type: Sequelize.FLOAT,
      },
      speciesCode: {
        type: Sequelize.STRING,
        references: {
          model: "tree_species",
          key: "code",
        },
      },
      statusId: {
        type: Sequelize.UUID,
        references: {
          model: "tree_status",
          key: "id",
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
        fields: ["lat", "long"],
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
