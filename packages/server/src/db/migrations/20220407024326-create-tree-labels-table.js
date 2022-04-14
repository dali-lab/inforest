"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Create tree-labels table.
      await queryInterface.createTable(
        "tree_labels",
        {
          code: {
            type: Sequelize.STRING,
            primaryKey: true,
          },
          description: {
            type: Sequelize.STRING,
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
          },
        },
        { transaction }
      );

      // Create through table.
      await queryInterface.createTable(
        "tree_census_labels",
        {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
          },
          treeTag: {
            type: Sequelize.STRING,
            references: {
              model: "trees",
              key: "tag",
            },
          },
          treeLabelCode: {
            type: Sequelize.STRING,
            references: {
              model: "tree_labels",
              key: "code",
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
        },
        { transaction }
      );
      await transaction.commit();
    } catch (err) {
      console.log(err);
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("tree_census_labels");
    await queryInterface.dropTable("tree_labels");
  },
};
