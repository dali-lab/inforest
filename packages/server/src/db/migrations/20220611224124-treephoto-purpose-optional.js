"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.changeColumn(
        "tree_photos",
        "purposeName",
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );
      await transaction.commit();
    } catch (err) {
      console.error(err);
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(
        `UPDATE tree_photos SET "purposeName" = 'FULL' WHERE "purposeName" = NULL`,
        { transaction }
      );
      await queryInterface.changeColumn(
        "tree_photos",
        "purposeName",
        {
          type: Sequelize.STRING,
          allowNull: false,
          references: {
            model: "tree_photo_purposes",
            key: "name",
          },
        },
        { transaction }
      );
      await transaction.commit();
    } catch (err) {
      console.error(err);
      await transaction.rollback();
      throw err;
    }
  },
};
