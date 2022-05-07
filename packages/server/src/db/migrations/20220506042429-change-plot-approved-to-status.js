"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // add status
      await queryInterface.addColumn(
        "plot_census",
        "status",
        { type: Sequelize.STRING },
        { transaction }
      );

      // select plot census approved status and update statuses
      const plotCensuses = await queryInterface.sequelize.query(
        "SELECT id, approved FROM plot_census",
        { transaction, type: Sequelize.QueryTypes.SELECT }
      );
      await Promise.all(
        plotCensuses.map((census) =>
          queryInterface.bulkUpdate(
            "plot_census",
            {
              status: census.approved ? "APPROVED" : "IN_PROGRESS",
            },
            {
              id: census.id,
            },
            { transaction }
          )
        )
      );

      // remove approved
      await queryInterface.removeColumn("plot_census", "approved", {
        transaction,
      });

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
      // add approved
      await queryInterface.addColumn(
        "plot_census",
        "approved",
        { type: Sequelize.BOOLEAN },
        { transaction }
      );

      // select plot census status and update approved
      const plotCensuses = await queryInterface.sequelize.query(
        "SELECT id, status FROM plot_census",
        { transaction, type: Sequelize.QueryTypes.SELECT }
      );
      await Promise.all(
        plotCensuses.map((census) =>
          queryInterface.bulkUpdate(
            "plot_census",
            {
              approved: census.status == "APPROVED" ? true : false,
            },
            {
              id: census.id,
            },
            { transaction }
          )
        )
      );

      // remove status
      await queryInterface.removeColumn("plot_census", "status", {
        transaction,
      });

      await transaction.commit();
    } catch (e) {
      console.error(e);
      await transaction.rollback();
      throw e;
    }
  },
};
