"use strict";

const uuid = require("uuid4");

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // add flagged column
      await queryInterface.addColumn(
        "tree_census",
        "flagged",
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        { transaction }
      );

      // find tree censuses with problem label
      const problem_censuses = await queryInterface.sequelize.query(
        'SELECT tree_census.id AS "treeCensusId", tree_census_labels.id AS "treeCensusLabelsId" FROM tree_census INNER JOIN tree_census_labels ON tree_census_labels."treeCensusId"=tree_census.id WHERE tree_census_labels."treeLabelCode"=\'P\'',
        { transaction, type: Sequelize.QueryTypes.SELECT }
      );

      // set flagged to true where there was a problem label
      await Promise.all(
        problem_censuses.map((tree_census) => {
          return queryInterface.bulkUpdate(
            "tree_census",
            { flagged: true },
            { id: tree_census.treeCensusId },
            { transaction }
          );
        })
      );

      // remove problem label assignments
      await Promise.all(
        problem_censuses.map((tree_census) => {
          return queryInterface.bulkDelete(
            "tree_census_labels",
            { id: tree_census.treeCensusLabelsId },
            { transaction }
          );
        })
      );

      // remove problem label
      await queryInterface.bulkDelete(
        "tree_labels",
        { code: "P" },
        { transaction }
      );

      await transaction.commit();
    } catch (e) {
      console.log(e);
      await transaction.rollback();
      throw e;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // add problem label
      await queryInterface.bulkInsert(
        "tree_labels",
        [
          {
            code: "P",
            description: "any problem requiring further attention",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        { transaction }
      );

      // find flagged tree censuses
      const problem_censuses = await queryInterface.sequelize.query(
        'SELECT id AS "treeCensusId", "createdAt", "updatedAt" FROM tree_census WHERE flagged=true',
        { transaction, type: Sequelize.QueryTypes.SELECT }
      );

      // insert problem label for each flagged tree census
      await Promise.all(
        problem_censuses.map((census) => {
          const { treeCensusId, createdAt, updatedAt } = census;
          return queryInterface.bulkInsert(
            "tree_census_labels",
            [
              {
                id: uuid(),
                treeLabelCode: "P",
                treeCensusId,
                createdAt,
                updatedAt,
              },
            ],
            { transaction }
          );
        })
      );

      // remove flagged column
      await queryInterface.removeColumn("tree_census", "flagged", {
        transaction,
      });

      await transaction.commit();
    } catch (e) {
      console.log(e);
      await transaction.rollback();
      throw e;
    }
  },
};
