'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // remove height column
      await queryInterface.removeColumn("tree_census", "height", {
        transaction,
      });

      await transaction.commit();
    } catch (e) {
      console.log(e);
      await transaction.rollback();
      throw e;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // add height column
      await queryInterface.addColumn(
        "tree_census",
        "height",
        {
          type: Sequelize.FLOAT,
        },
        { transaction }
      );

      await transaction.commit();
    } catch (e) {
      console.log(e);
      await transaction.rollback();
      throw e;
    }
  },
};
