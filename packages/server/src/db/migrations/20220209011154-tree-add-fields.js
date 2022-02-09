"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        "trees",
        "tripId",
        {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "trips",
            key: "id",
          },
        },
        { transaction }
      );
      await queryInterface.addColumn(
        "trees",
        "authorId",
        {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "users",
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
      await queryInterface.removeColumn("trees", "tripId");
      await queryInterface.removeColumn("trees", "authorId");
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
