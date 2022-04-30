"use strict";

const uuid = require("uuid4");

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn("tree_census", "tripId", {
        transaction,
      });

      await queryInterface.dropTable("trips", { transaction });

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
      // create trips table
      await queryInterface.createTable(
        "trips",
        {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
          },
          name: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          forestId: {
            type: Sequelize.UUID,
            references: {
              model: "forests",
              key: "id",
            },
            allowNull: false,
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

      // select forests
      const forests = await queryInterface.sequelize.query(
        "SELECT id FROM forests",
        {
          transaction,
          type: Sequelize.QueryTypes.SELECT,
        }
      );

      // insert one trip for each forest and set tree census ids to this id
      if (forests.length > 0) {
        await Promise.all(
          forests.map(async (forest) => {
            const tripId = uuid();
            await queryInterface.bulkInsert(
              "trips",
              [
                {
                  id: tripId,
                  name: "Default trip",
                  forestId: forest.id,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ],
              { transaction }
            );
          })
        );
      }

      // add tripid column to tree_census
      await queryInterface.addColumn(
        "tree_census",
        "tripId",
        {
          type: Sequelize.UUID,
          allowNull: true,
        },
        { transaction }
      );

      // get id of tree census and id of corresponding trip
      const tree_censuses = await queryInterface.sequelize.query(
        `SELECT tree_census.id AS "treeCensusId", trips.id AS "tripId" FROM tree_census LEFT OUTER JOIN trees ON tree_census."treeId"=trees.id LEFT OUTER JOIN plots ON plots.id = trees."plotId" LEFT OUTER JOIN forests ON forests.id = plots."forestId" LEFT OUTER JOIN trips ON forests.id = trips."forestId"`,
        {
          transaction,
          type: Sequelize.QueryTypes.SELECT,
        }
      );

      // update new column in tree_census
      if (tree_censuses.length > 0) {
        await Promise.all(
          tree_censuses.map(async (tree_census) => {
            await queryInterface.bulkUpdate(
              "tree_census",
              {
                tripId: tree_census.tripId,
              },
              {
                id: tree_census.treeCensusId,
              },
              { transaction }
            );
          })
        );
      }

      // add foreign key constraint
      // add tripid column to tree_census
      await queryInterface.changeColumn(
        "tree_census",
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

      await transaction.commit();
    } catch (e) {
      console.error(e);
      await transaction.rollback();
      throw e;
    }
  },
};
