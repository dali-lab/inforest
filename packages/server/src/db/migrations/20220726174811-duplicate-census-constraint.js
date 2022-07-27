"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(
        `DELETE from tree_census WHERE ("plotCensusId","treeId","updatedAt") NOT IN (SELECT "plotCensusId","treeId",MAX("updatedAt") FROM tree_census GROUP BY "plotCensusId","treeId")`
      );
      await queryInterface.addConstraint("tree_census", {
        fields: ["plotCensusId", "treeId"],
        type: "unique",
      });
      await transaction.commit();
    } catch (err) {
      console.error(err);
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint(
        "tree_census",
        "tree_census_plotCensusId_treeId_uk"
      );
      await queryInterface.removeIndex(
        "tree_census",
        "tree_census_plotCensusId_treeId_uk"
      );
      await transaction.commit();
    } catch (err) {
      console.error(err);
      await transaction.rollback();
      throw err;
    }
  },
};
