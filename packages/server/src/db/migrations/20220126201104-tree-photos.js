"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tree_photos", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      treeTag: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "trees",
          key: "tag",
        },
      },
      url: {
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
    await queryInterface.addIndex("tree_photos", {
      name: "type",
      fields: ["type"],
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("tree_photos");
  },
};
