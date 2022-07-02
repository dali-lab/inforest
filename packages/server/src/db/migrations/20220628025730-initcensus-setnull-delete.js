"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint("trees", "trees_initCensusId_fkey");
      await queryInterface.changeColumn(
        "trees",
        "initCensusId",
        {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: "tree_census",
            key: "id",
          },
          onDelete: "SET NULL",
        },
        { transaction }
      );
      await transaction.commit();
    } catch (e) {
      console.error(e);
      await transaction.rollback();
      throw e;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint("trees", "trees_initCensusId_fkey");
      await queryInterface.changeColumn(
        "trees",
        "initCensusId",
        {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: "tree_census",
            key: "id",
          },
        },
        { transaction }
      );
      await transaction.commit();
    } catch (e) {
      console.error(e);
      await transaction.rollback();
      throw e;
    }
  },
};
