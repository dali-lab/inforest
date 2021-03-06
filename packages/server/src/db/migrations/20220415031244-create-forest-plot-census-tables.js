"use strict";

const uuid = require("uuid4");

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // create forest census table
      await queryInterface.createTable(
        "forest_census",
        {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
          },
          name: {
            type: Sequelize.STRING,
          },
          active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
          },
          forestId: {
            type: Sequelize.UUID,
            references: {
              model: "forests",
              key: "id",
            },
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
          },
        },
        { transaction }
      );

      // create plot census table
      await queryInterface.createTable(
        "plot_census",
        {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
          },
          status: {
            type: Sequelize.ENUM("IN_PROGRESS", "PENDING", "APPROVED"),
            defaultValue: "IN_PROGRESS",
          },
          plotNumber: {
            type: Sequelize.STRING,
            references: {
              model: "plots",
              key: "number",
            },
          },
          forestCensusId: {
            type: Sequelize.UUID,
            references: {
              model: "forest_census",
              key: "id",
            },
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
          },
        },
        { transaction }
      );

      // create plot census assignment table
      await queryInterface.createTable(
        "plot_census_assignment",
        {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
          },
          plotCensusId: {
            type: Sequelize.UUID,
            references: {
              model: "plot_census",
              key: "id",
            },
          },
          userId: {
            type: Sequelize.UUID,
            references: {
              model: "users",
              key: "id",
            },
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
          },
        },
        { transaction }
      );

      // create one default forest census for each forest that has data
      // select the ids of all forests that have tree entries (may have duplicates)
      const forests = await queryInterface.sequelize.query(
        'SELECT forests.id FROM tree_census LEFT OUTER JOIN trees ON tree_census."treeTag" = trees.tag LEFT OUTER JOIN plots ON trees."plotNumber" = plots.number LEFT OUTER JOIN forests ON plots."forestId" = forests.id;',
        {
          transaction,
          type: Sequelize.QueryTypes.SELECT,
        }
      );

      // remove duplicates
      const uniqueForestIds = [];
      forests.map((forest) => {
        if (!uniqueForestIds.includes(forest.id)) {
          uniqueForestIds.push(forest.id);
        }
      });

      // insert in table
      if (uniqueForestIds.length > 0) {
        await queryInterface.bulkInsert(
          "forest_census",
          uniqueForestIds.map((forestId) => ({
            id: uuid(),
            name: "Initial Data",
            active: false,
            forestId,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
          { transaction }
        );
      }

      // create one default plot census for each plot that has data
      // select the numbers of all plots that have tree entries (may have duplicates)
      const plots = await queryInterface.sequelize.query(
        'SELECT plots.number AS "plotNumber", forest_census.id AS "forestCensusId" FROM tree_census LEFT OUTER JOIN trees ON tree_census."treeTag" = trees.tag LEFT OUTER JOIN plots ON trees."plotNumber" = plots.number LEFT OUTER JOIN forests ON plots."forestId" = forests.id LEFT OUTER JOIN forest_census ON forests.id = forest_census."forestId";',
        {
          transaction,
          type: Sequelize.QueryTypes.SELECT,
        }
      );

      // remove duplicates
      const uniquePlots = [];
      plots.map((plot) => {
        if (!uniquePlots.some((value) => plot.plotNumber == value.plotNumber)) {
          uniquePlots.push({ ...plot, plotCensusId: uuid() });
        }
      });

      // insert plot censuses
      if (uniquePlots.length > 0) {
        await queryInterface.bulkInsert(
          "plot_census",
          uniquePlots.map((plot) => ({
            id: plot.plotCensusId,
            approved: true,
            plotNumber: plot.plotNumber,
            forestCensusId: plot.forestCensusId,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
          { transaction }
        );
      }

      // insert assignments to default user
      const dataSeederId = "24ea9f85-5352-4f69-b642-23291a27ff1e";
      if (uniquePlots.length > 0) {
        await queryInterface.bulkInsert(
          "plot_census_assignment",
          uniquePlots.map((plot) => ({
            id: uuid(),
            plotCensusId: plot.plotCensusId,
            userId: dataSeederId,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
          { transaction }
        );
      }

      // add plot census id column to tree census table
      await queryInterface.addColumn(
        "tree_census",
        "plotCensusId",
        {
          type: Sequelize.UUID,
          references: {
            model: "plot_census",
            key: "id",
          },
        },
        { transaction }
      );

      // update column values
      const treeCensuses = await queryInterface.sequelize.query(
        'SELECT plot_census.id AS "plotCensusId", tree_census.id AS "treeCensusId" FROM tree_census LEFT OUTER JOIN trees ON tree_census."treeTag" = trees.tag LEFT OUTER JOIN plots ON trees."plotNumber" = plots.number LEFT OUTER JOIN plot_census ON plots.number = plot_census."plotNumber";',
        {
          transaction,
          type: Sequelize.QueryTypes.SELECT,
        }
      );

      if (treeCensuses.length > 0) {
        await Promise.all(
          treeCensuses.map(async (census) => {
            return queryInterface.bulkUpdate(
              "tree_census",
              { plotCensusId: census.plotCensusId },
              { id: census.treeCensusId },
              { transaction }
            );
          })
        );
      }

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
      await queryInterface.removeColumn("tree_census", "plotCensusId", {
        transaction,
      });
      await queryInterface.dropTable("plot_census_assignment", { transaction });
      await queryInterface.dropTable("plot_census", { transaction });
      await queryInterface.dropTable("forest_census", { transaction });

      await transaction.commit();
    } catch (e) {
      console.error(e);
      await transaction.rollback();
      throw e;
    }
  },
};
