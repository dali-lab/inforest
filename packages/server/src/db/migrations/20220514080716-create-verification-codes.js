"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // create forest census table
      await queryInterface.createTable(
        "verification_codes",
        {
          email: {
            type: Sequelize.STRING,
            primaryKey: true,
          },
          code: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          expiration: {
            type: Sequelize.DATE,
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
      await queryInterface.dropTable("verification-codes", { transaction });

      await transaction.commit();
    } catch (e) {
      console.error(e);
      await transaction.rollback();
      throw e;
    }
  },
};
