"use strict";

const uuid = require("uuid4");

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // add labels equivalent to existing status
      let data = await queryInterface.sequelize.query(
        'SELECT tree_census.id, trees."statusName", tree_census."createdAt", tree_census."updatedAt" FROM tree_census LEFT OUTER JOIN trees ON trees.tag = tree_census."treeTag";',
        { transaction, type: Sequelize.QueryTypes.SELECT }
      );

      const statusLabels = {
        DEAD_FALLEN: "DC",
        DEAD_STANDING: "DS",
        // there is no label equivalent for ALIVE
      };

      // remove alive trees from data
      data = data.filter((row) => {
        return row.statusName in statusLabels;
      });

      if (data.length) {
        await queryInterface.bulkInsert(
          "tree_census_labels",
          data.map((row) => ({
            id: uuid(),
            treeLabelCode: statusLabels[row.statusName],
            treeCensusId: row.id,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
          })),
          { transaction }
        );
      }

      // remove status column from trees
      await queryInterface.removeColumn("trees", "statusName", { transaction });

      // drop status table
      await queryInterface.dropTable("tree_statuses", { transaction });

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
      // create tree status table
      await queryInterface.createTable("tree_statuses", {
        name: {
          type: Sequelize.STRING,
          primaryKey: true,
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

      // seed table
      await queryInterface.bulkInsert(
        "tree_statuses",
        [
          {
            name: "ALIVE",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: "DEAD_STANDING",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: "DEAD_FALLEN",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        { transaction }
      );

      // add status column, default to ALIVE
      await queryInterface.addColumn(
        "trees",
        "statusName",
        {
          type: Sequelize.STRING,
          defaultValue: "ALIVE",
          references: {
            model: "tree_statuses",
            key: "name",
          },
        },
        { transaction }
      );

      // add statuses equivalent to existing labels
      const data = await queryInterface.sequelize.query(
        'SELECT tree_census_labels."treeLabelCode", trees.tag FROM tree_census_labels LEFT OUTER JOIN tree_census ON tree_census_labels."treeCensusId" = tree_census.id LEFT OUTER JOIN trees ON trees.tag = tree_census."treeTag";',
        { transaction, type: Sequelize.QueryTypes.SELECT }
      );

      const labelStatuses = {
        DC: "DEAD_FALLEN",
        DS: "DEAD_STANDING",
        // there is no label equivalent for ALIVE
      };

      data
        .filter((row) => {
          row.treeLabelCode in labelStatuses;
        })
        .map(async (row) => {
          await queryInterface.bulkUpdate(
            "trees",
            {
              statusName: labelStatuses[row.treeLabelCode],
            },
            {
              tag: row.tag,
            },
            { transaction }
          );
        });

      await transaction.commit();
    } catch (e) {
      console.error(e);
      await transaction.rollback();
      throw e;
    }
  },
};
