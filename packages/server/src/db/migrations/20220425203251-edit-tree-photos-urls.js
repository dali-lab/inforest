"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn("tree_photos", "fullUrl", {
        type: Sequelize.STRING,
        allowNull: false,
      });
      // Migrating previous urls to new fullUrl field
      await queryInterface.sequelize.query(
        'UPDATE tree_photos SET "fullUrl" = url'
      );
      await queryInterface.addColumn("tree_photos", "thumbUrl", {
        type: Sequelize.STRING,
        allowNull: false,
      });
      await queryInterface.removeColumn("tree_photos", "url");
    } catch (err) {
      console.error(err);
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn("tree_photos", "url", {
        type: Sequelize.STRING,
        allowNull: false,
      });
      // Migrating previous urls to new fullUrl field
      await queryInterface.sequelize.query(
        'UPDATE tree_photos SET url = "fullUrl"'
      );
      await queryInterface.removeColumn("tree_photos", "fullUrl");
      await queryInterface.removeColumn("tree_photos", "thumbUrl");
    } catch (err) {
      console.error(err);
      await transaction.rollback();
      throw err;
    }
  },
};
