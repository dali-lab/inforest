"use strict";

const uuid = require("uuid4");

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // add new id column
      await queryInterface.addColumn(
        "plots",
        "id",
        { type: Sequelize.UUID, default: Sequelize.UUID, unique: true },
        { transaction }
      );

      // get all plot numbers
      const plots = await queryInterface.sequelize.query(
        "SELECT number FROM plots",
        { transaction, type: Sequelize.QueryTypes.SELECT }
      );

      // create unique id for each plot and store in dictionary as number:id pair
      const dictionary = {};
      await Promise.all(
        plots.map(async (plot) => {
          dictionary[plot.number] = uuid();
          await queryInterface.bulkUpdate(
            "plots",
            { id: dictionary[plot.number] },
            { number: plot.number },
            { transaction }
          );
        })
      );

      // change foreign keys in other tables to the id:
      //  add new column
      //  insert values
      //  move foreign key constraint to new column
      //  remove old column

      // trees
      await queryInterface.addColumn(
        "trees",
        "plotId",
        { type: Sequelize.UUID },
        { transaction }
      );
      await Promise.all(
        Object.keys(dictionary).map(async (plotNumber) => {
          await queryInterface.bulkUpdate(
            "trees",
            { plotId: dictionary[plotNumber] },
            { plotNumber },
            { transaction }
          );
        })
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE trees DROP CONSTRAINT "trees_plotNumber_fkey"; ALTER TABLE trees ADD CONSTRAINT "trees_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES plots (id)',
        { transaction }
      );
      await queryInterface.removeColumn("trees", "plotNumber", { transaction });

      // plot census
      await queryInterface.addColumn(
        "plot_census",
        "plotId",
        { type: Sequelize.UUID },
        { transaction }
      );
      await Promise.all(
        Object.keys(dictionary).map(async (plotNumber) => {
          await queryInterface.bulkUpdate(
            "plot_census",
            { plotId: dictionary[plotNumber] },
            { plotNumber },
            { transaction }
          );
        })
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE plot_census DROP CONSTRAINT "plot_census_plotNumber_fkey"; ALTER TABLE plot_census ADD CONSTRAINT "plot_census_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES plots (id)',
        { transaction }
      );
      await queryInterface.removeColumn("plot_census", "plotNumber", {
        transaction,
      });

      // unmake number primary key; make id primary key
      await queryInterface.sequelize.query(
        "ALTER TABLE plots DROP CONSTRAINT plots_pkey; ALTER TABLE plots ADD PRIMARY KEY (id)",
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
      // make number unique
      await queryInterface.changeColumn(
        "plots",
        "number",
        {
          type: Sequelize.STRING,
          unique: true,
        },
        { transaction }
      );

      // get all plot ids and numbers
      const plots = await queryInterface.sequelize.query(
        "SELECT id, number FROM plots",
        { transaction, type: Sequelize.QueryTypes.SELECT }
      );

      // turn into dictionary of id:number pairs
      const dictionary = {};
      plots.map((plot) => {
        dictionary[plot.id] = plot.number;
      });

      // change foreign keys in other tables back to the number:
      //  add new column
      //  insert values
      //  move foreign key constraint to new column
      //  remove old column

      // trees
      await queryInterface.addColumn(
        "trees",
        "plotNumber",
        { type: Sequelize.STRING },
        { transaction }
      );
      await Promise.all(
        Object.keys(dictionary).map(async (plotId) => {
          await queryInterface.bulkUpdate(
            "trees",
            { plotNumber: dictionary[plotId] },
            { plotId },
            { transaction }
          );
        })
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE trees DROP CONSTRAINT "trees_plotId_fkey"; ALTER TABLE trees ADD CONSTRAINT "trees_plotNumber_fkey" FOREIGN KEY ("plotNumber") REFERENCES plots (number)',
        { transaction }
      );
      await queryInterface.removeColumn("trees", "plotId", { transaction });

      // plot census
      await queryInterface.addColumn(
        "plot_census",
        "plotNumber",
        { type: Sequelize.STRING },
        { transaction }
      );
      await Promise.all(
        Object.keys(dictionary).map(async (plotId) => {
          await queryInterface.bulkUpdate(
            "plot_census",
            { plotNumber: dictionary[plotId] },
            { plotId },
            { transaction }
          );
        })
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE plot_census DROP CONSTRAINT "plot_census_plotId_fkey"; ALTER TABLE plot_census ADD CONSTRAINT "plot_census_plotNumber_fkey" FOREIGN KEY ("plotNumber") REFERENCES plots (number)',
        { transaction }
      );
      await queryInterface.removeColumn("plot_census", "plotId", {
        transaction,
      });

      // unmake id primary key, make number primary key
      await queryInterface.sequelize.query(
        "ALTER TABLE plots DROP CONSTRAINT plots_pkey; ALTER TABLE plots ADD PRIMARY KEY (number)",
        { transaction }
      );

      // remove id column
      await queryInterface.removeColumn("plots", "id", { transaction });

      await transaction.commit();
    } catch (e) {
      console.error(e);
      await transaction.rollback();
      throw e;
    }
  },
};
