'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("memberships", {
      teamId: {
        type: Sequelize.UUID,
        primaryKey:true
      },
      userId: {
        type:Sequelize.UUID,
        primaryKey:true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("memberships");
  },
};
