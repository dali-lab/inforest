'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("memberships", {
      id: {
        type: Sequelize.UUID,
        primaryKey:true
      },
      teamId: {
        type: Sequelize.UUID,
        primaryKey:true
      },
      userId: {
        type:Sequelize.UUID,
        primaryKey:true
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false
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
