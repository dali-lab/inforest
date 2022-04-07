"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Create tree-labels table.
      await queryInterface.createTable(
        "tree-labels",
        {
          code: {
            type: Sequelize.STRING,
            primaryKey: true,
          },
          description: {
            type: Sequelize.STRING,
          },
        },
        { transaction }
      );

      // Create through table.
      await queryInterface.createTable(
        "tree-tree-label",
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
          labelCode: {
            type: Sequelize.STRING,
            references: {
              model: "tree-labels",
              key: "code",
            },
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
    await queryInterface.dropTable("tree-tree-label");
    await queryInterface.dropTable("tree-labels");
  },
};
