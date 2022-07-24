"use strict";
const uuid = require("uuid4");

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      /**
       *
       * MIGRATE CENSUS_ENTRIES TABLE
       *
       */

      // Create tree_census table.
      await queryInterface.createTable(
        "tree_census",
        {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
          },
          treeTag: {
            type: Sequelize.STRING,
            references: {
              model: "trees",
              key: "tag",
            },
          },
          dbh: {
            type: Sequelize.FLOAT,
          },
          tripId: {
            type: Sequelize.UUID,
            references: {
              model: "trips",
              key: "id",
            },
          },
          authorId: {
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

      // Grab existing trees and create census entries for them.
      const existingTrees = await queryInterface.sequelize.query(
        "SELECT * FROM trees;",
        { transaction, type: Sequelize.QueryTypes.SELECT }
      );

      const treeTagToTreeCensusId = {};

      if (existingTrees.length) {
        await queryInterface.bulkInsert(
          "tree_census",
          existingTrees.map((existingTree) => {
            treeTagToTreeCensusId[existingTree.tag] = uuid();
            return {
              id: treeTagToTreeCensusId[existingTree.tag],
              treeTag: existingTree.tag,
              dbh: existingTree.dbh,
              tripId: existingTree.tripId,
              authorId: existingTree.authorId,
              createdAt: existingTree.createdAt,
              updatedAt: existingTree.updatedAt,
            };
          }),
          { transaction }
        );
      }

      /**
       *
       * MIGRATE TREES TABLE
       *
       */

      // Remove columns from trees table.
      await queryInterface.removeColumn("trees", "dbh", { transaction });
      await queryInterface.removeColumn("trees", "tripId", { transaction });
      await queryInterface.removeColumn("trees", "authorId", { transaction });

      /**
       *
       * MIGRATE TREE_PHOTOS TABLE
       *
       */

      // Update tree_photos to point to tree_census.
      await queryInterface.addColumn(
        "tree_photos",
        "treeCensusId",
        {
          type: Sequelize.UUID,
          references: {
            model: "tree_census",
            key: "id",
          },
          onDelete: "CASCADE",
        },
        { transaction }
      );

      // Grab existing tree photos.
      const existingTreePhotos = await queryInterface.sequelize.query(
        "SELECT * FROM tree_photos;",
        { transaction, type: Sequelize.QueryTypes.SELECT }
      );

      if (existingTreePhotos.length) {
        await Promise.all(
          existingTreePhotos.map((existingTreePhoto) => {
            const { treeTag } = existingTreePhoto;
            const treeCensusId = treeTagToTreeCensusId[treeTag];
            return queryInterface.bulkUpdate(
              "tree_photos",
              {
                treeCensusId,
              },
              {
                id: existingTreePhoto.id,
              },
              { transaction }
            );
          })
        );
      }

      // Make tree_photos.treeCensusId mandatory.
      await queryInterface.changeColumn(
        "tree_photos",
        "treeCensusId",
        {
          type: Sequelize.UUID,
          allowNull: false,
        },
        { transaction }
      );

      // Remove tree_photos.treeTag.
      await queryInterface.removeColumn("tree_photos", "treeTag", {
        transaction,
      });

      /**
       *
       * MIGRATE TREE_TREE_LABEL TABLE
       *
       */

      // Rename table.
      await queryInterface.renameTable(
        "tree_tree_label",
        "tree_census_labels",
        { transaction }
      );

      // Update tree_census_labels to point to tree_census.
      await queryInterface.addColumn(
        "tree_census_labels",
        "treeCensusId",
        {
          type: Sequelize.UUID,
          references: {
            model: "tree_census",
            key: "id",
          },
          onDelete: "CASCADE",
        },
        { transaction }
      );

      // Grab existing tree to tree labels through table rows.
      const existingTreeCensusLabelRows = await queryInterface.sequelize.query(
        "SELECT * FROM tree_census_labels;",
        { transaction, type: Sequelize.QueryTypes.SELECT }
      );

      if (existingTreeCensusLabelRows.length) {
        await Promise.all(
          existingTreeCensusLabelRows.map((existingTreeCensusLabelRow) => {
            const { treeTag, id } = existingTreeCensusLabelRow;
            const treeCensusId = treeTagToTreeCensusId[treeTag];
            return queryInterface.bulkUpdate(
              "tree_census_labels",
              {
                treeCensusId,
              },
              {
                id,
              },
              { transaction }
            );
          })
        );
      }

      // Make tree_census_labels.treeCensusId mandatory.
      await queryInterface.changeColumn(
        "tree_census_labels",
        "treeCensusId",
        {
          type: Sequelize.UUID,
          allowNull: false,
        },
        { transaction }
      );

      // Remove tree_census_labels.treeTag.
      await queryInterface.removeColumn("tree_census_labels", "treeTag", {
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
      const treeCensusIdToTreeTag = {};
      const mostRecentTreeCensusForTree = {};

      const existingCensusedTrees = await queryInterface.sequelize.query(
        "SELECT * FROM tree_census;",
        { transaction, type: Sequelize.QueryTypes.SELECT }
      );

      existingCensusedTrees
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .forEach((existingTreeCensus) => {
          treeCensusIdToTreeTag[existingTreeCensus.id] =
            existingTreeCensus.treeTag;
          mostRecentTreeCensusForTree[existingTreeCensus.treeTag] =
            existingTreeCensus;
        });

      /**
       *
       * UNMIGRATE TREES TABLE
       *
       */

      // Add trees.dbh, trees.statusName, trees.tripId, trees.authorId.
      await queryInterface.addColumn(
        "trees",
        "dbh",
        {
          type: Sequelize.FLOAT,
        },
        { transaction }
      );
      await queryInterface.addColumn(
        "trees",
        "tripId",
        {
          type: Sequelize.UUID,
          references: {
            model: "trips",
            key: "id",
          },
        },
        { transaction }
      );
      await queryInterface.addColumn(
        "trees",
        "authorId",
        {
          type: Sequelize.UUID,
          references: {
            model: "users",
            key: "id",
          },
        },
        { transaction }
      );

      Object.entries(mostRecentTreeCensusForTree).map(
        ([tag, mostRecentTreeCensus]) => {
          const { dbh, tripId, authorId, updatedAt } =
            mostRecentTreeCensus;
          return queryInterface.bulkUpdate(
            "trees",
            {
              dbh,
              tripId,
              authorId,
              updatedAt,
            },
            {
              tag,
            },
            { transaction }
          );
        }
      );

      // Make trees.tripId and trees.authorId mandatory.
      await queryInterface.changeColumn(
        "trees",
        "tripId",
        {
          type: Sequelize.UUID,
          allowNull: false,
        },
        { transaction }
      );
      await queryInterface.changeColumn(
        "trees",
        "authorId",
        {
          type: Sequelize.UUID,
          allowNull: false,
        },
        { transaction }
      );

      /**
       *
       * UNMIGRATE TREE_TREE_LABEL TABLE
       *
       */

      // Add tree_census_labels.treeTag.
      await queryInterface.addColumn(
        "tree_census_labels",
        "treeTag",
        {
          type: Sequelize.STRING,
          references: {
            model: "trees",
            key: "tag",
          },
        },
        { transaction }
      );

      // Grab existing tree to tree labels through table rows.
      const existingTreeCensusLabelRows = await queryInterface.sequelize.query(
        "SELECT * FROM tree_census_labels;",
        { transaction, type: Sequelize.QueryTypes.SELECT }
      );

      // Copy tree_census_labels.treeCensusId to tree_census_labels.treeTag.
      await Promise.all(
        existingTreeCensusLabelRows.map(async (existingTreeCensusLabelRow) => {
          const { id, treeCensusId } = existingTreeCensusLabelRow;
          await queryInterface.bulkUpdate(
            "tree_census_labels",
            {
              treeTag: treeCensusIdToTreeTag[treeCensusId],
            },
            {
              id,
            },
            { transaction }
          );
        })
      );

      // Make tree_census_labels.treeTag mandatory.
      await queryInterface.changeColumn(
        "tree_census_labels",
        "treeTag",
        {
          type: Sequelize.STRING,
          allowNull: false,
        },
        { transaction }
      );

      // Remove tree_census_labels.treeCensusId.
      await queryInterface.removeColumn("tree_census_labels", "treeCensusId", {
        transaction,
      });

      await queryInterface.renameTable(
        "tree_census_labels",
        "tree_tree_label",
        { transaction }
      );
      /**
       *
       * UNMIGRATE TREE_PHOTOS TABLE
       *
       */

      // Add tree_photos.treeTag.
      await queryInterface.addColumn(
        "tree_photos",
        "treeTag",
        {
          type: Sequelize.STRING,
          references: {
            model: "trees",
            key: "tag",
          },
        },
        { transaction }
      );

      // Grab existing tree photos.
      const existingTreePhotos = await queryInterface.sequelize.query(
        "SELECT * FROM tree_photos;",
        { transaction, type: Sequelize.QueryTypes.SELECT }
      );

      // Copy tree_photos.treeCensusId to tree_photos.treeTag.
      await Promise.all(
        existingTreePhotos.map(async (existingTreePhoto) => {
          const { id, treeCensusId } = existingTreePhoto;
          await queryInterface.bulkUpdate(
            "tree_photos",
            {
              treeTag: treeCensusIdToTreeTag[treeCensusId],
            },
            {
              id,
            },
            { transaction }
          );
        })
      );

      // Make tree_photos.treeTag mandatory.
      await queryInterface.changeColumn(
        "tree_photos",
        "treeTag",
        {
          type: Sequelize.STRING,
          allowNull: false,
        },
        { transaction }
      );

      // Remove tree_photos.treeCensusId.
      await queryInterface.removeColumn("tree_photos", "treeCensusId", {
        transaction,
      });

      /**
       *
       * UNMIGRATE CENSUS_ENTRIES TABLE
       *
       */

      await queryInterface.dropTable("tree_census", { transaction });

      await transaction.commit();
    } catch (e) {
      console.error(e);
      await transaction.rollback();
      throw e;
    }
  },
};
