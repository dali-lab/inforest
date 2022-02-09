"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        "plots",
        "forestId",
        {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "forests",
            key: "id",
          },
        },
        { transaction }
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn("plots", "forestId");
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
