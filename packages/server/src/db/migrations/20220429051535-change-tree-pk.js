"use strict";

const uuid = require("uuid4");

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // add new id column
      await queryInterface.addColumn(
        "trees",
        "id",
        { type: Sequelize.UUID, default: Sequelize.UUID, unique: true },
        { transaction }
      );

      // get all tree tags
      const trees = await queryInterface.sequelize.query(
        "SELECT tag FROM trees",
        { transaction, type: Sequelize.QueryTypes.SELECT }
      );

      // create unique id for each tree and store in dictionary as tag:id pair
      const dictionary = {};
      await Promise.all(
        trees.map(async (tree) => {
          dictionary[tree.tag] = uuid();
          await queryInterface.bulkUpdate(
            "trees",
            { id: dictionary[tree.tag] },
            { tag: tree.tag },
            { transaction }
          );
        })
      );

      // change foreign key in tree_census to the id:
      // add new column
      await queryInterface.addColumn(
        "tree_census",
        "treeId",
        { type: Sequelize.UUID },
        { transaction }
      );
      // insert values
      await Promise.all(
        Object.keys(dictionary).map(async (treeTag) => {
          await queryInterface.bulkUpdate(
            "tree_census",
            { treeId: dictionary[treeTag] },
            { treeTag },
            { transaction }
          );
        })
      );
      // move foreign key constraint to new column
      await queryInterface.sequelize.query(
        'ALTER TABLE tree_census DROP CONSTRAINT "tree_census_treeTag_fkey"; ALTER TABLE tree_census ADD CONSTRAINT "tree_census_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES trees (id)',
        { transaction }
      );
      // remove old column
      await queryInterface.removeColumn("tree_census", "treeTag", {
        transaction,
      });

      // unmake tag primary key; make id primary key
      await queryInterface.sequelize.query(
        "ALTER TABLE trees DROP CONSTRAINT trees_pkey; ALTER TABLE trees ADD PRIMARY KEY (id)",
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
      // make tag unique
      await queryInterface.changeColumn(
        "trees",
        "tag",
        {
          type: Sequelize.STRING,
          unique: true,
        },
        { transaction }
      );

      // get all tree ids and tags
      const trees = await queryInterface.sequelize.query(
        "SELECT id, tag FROM trees",
        { transaction, type: Sequelize.QueryTypes.SELECT }
      );

      // turn into dictionary of id:tag pairs
      const dictionary = {};
      trees.map((tree) => {
        dictionary[tree.id] = tree.tag;
      });

      // change foreign key in tree_census table back to the tag:
      // add new column
      await queryInterface.addColumn(
        "tree_census",
        "treeTag",
        { type: Sequelize.STRING },
        { transaction }
      );
      // insert values
      await Promise.all(
        Object.keys(dictionary).map(async (treeId) => {
          await queryInterface.bulkUpdate(
            "tree_census",
            { treeTag: dictionary[treeId] },
            { treeId },
            { transaction }
          );
        })
      );
      // move foreign key constraint to new column
      await queryInterface.sequelize.query(
        'ALTER TABLE tree_census DROP CONSTRAINT "tree_census_treeId_fkey"; ALTER TABLE tree_census ADD CONSTRAINT "tree_census_treeTag_fkey" FOREIGN KEY ("treeTag") REFERENCES trees (tag)',
        { transaction }
      );
      // remove old column
      await queryInterface.removeColumn("tree_census", "treeId", {
        transaction,
      });

      // unmake id primary key, make tag primary key
      await queryInterface.sequelize.query(
        "ALTER TABLE trees DROP CONSTRAINT trees_pkey; ALTER TABLE trees ADD PRIMARY KEY (tag)",
        { transaction }
      );

      // remove id column
      await queryInterface.removeColumn("trees", "id", { transaction });

      await transaction.commit();
    } catch (e) {
      console.error(e);
      await transaction.rollback();
      throw e;
    }
  },
};
