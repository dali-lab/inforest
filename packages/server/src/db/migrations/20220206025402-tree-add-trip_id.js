"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "tree",
          "tripId",
          {
            type: Sequelize.UUID,
            references: {
              model: "trip",
              key: "id",
            },
          },
          { transaction: t }
        ),
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("tree", "tripId", { transaction: t }),
      ]);
    });
  },
};
