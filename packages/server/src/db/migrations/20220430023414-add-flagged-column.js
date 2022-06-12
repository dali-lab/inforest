"use strict";

const uuid = require("uuid4");

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // add flagged column
      await queryInterface.addColumn(
        "tree_census",
        "flagged",
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
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

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // remove flagged column
      await queryInterface.removeColumn("tree_census", "flagged", {
        transaction,
      });

      await transaction.commit();
    } catch (e) {
      console.log(e);
      await transaction.rollback();
      throw e;
    }
  },
};
