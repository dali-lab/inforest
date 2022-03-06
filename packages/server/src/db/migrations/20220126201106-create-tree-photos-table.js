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
      purposeName: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "tree_photo_purposes",
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
    await queryInterface.addIndex("tree_photos", {
      name: "purposeName",
      fields: ["purposeName"],
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("tree_photos");
  },
};
