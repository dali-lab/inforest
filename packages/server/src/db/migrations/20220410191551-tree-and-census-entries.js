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

      // Create census_entries table.
      await queryInterface.createTable(
        "census_entries",
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
          height: {
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

      const treeTagToCensusEntryId = {};

      await queryInterface.bulkInsert(
        "census_entries",
        existingTrees.map((existingTree) => {
          treeTagToCensusEntryId[existingTree.tag] = uuid();
          return {
            id: treeTagToCensusEntryId[existingTree.tag],
            treeTag: existingTree.tag,
            dbh: existingTree.dbh,
            height: existingTree.height,
            tripId: existingTree.tripId,
            authorId: existingTree.authorId,
            createdAt: existingTree.createdAt,
            updatedAt: existingTree.updatedAt,
          };
        }),
        { transaction }
      );

      /**
       *
       * MIGRATE TREES TABLE
       *
       */

      // Remove columns from trees table.
      await queryInterface.removeColumn("trees", "dbh", { transaction });
      await queryInterface.removeColumn("trees", "height", { transaction });
      await queryInterface.removeColumn("trees", "tripId", { transaction });
      await queryInterface.removeColumn("trees", "authorId", { transaction });

      /**
       *
       * MIGRATE TREE_PHOTOS TABLE
       *
       */

      // Update tree_photos to point to census_entries.
      await queryInterface.addColumn(
        "tree_photos",
        "censusEntryId",
        {
          type: Sequelize.UUID,
          references: {
            model: "census_entries",
            key: "id",
          },
        },
        { transaction }
      );

      // Grab existing tree photos.
      const existingTreePhotos = await queryInterface.sequelize.query(
        "SELECT * FROM tree_photos;",
        { transaction, type: Sequelize.QueryTypes.SELECT }
      );

      await Promise.all(
        existingTreePhotos.map((existingTreePhoto) => {
          const { treeTag } = existingTreePhoto;
          const censusEntryId = treeTagToCensusEntryId[treeTag];
          return queryInterface.bulkUpdate(
            "tree_photos",
            {
              censusEntryId,
            },
            {
              id: existingTreePhoto.id,
            },
            { transaction }
          );
        })
      );

      // Make tree_photos.censusEntryId mandatory.
      await queryInterface.changeColumn(
        "tree_photos",
        "censusEntryId",
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

      // Update tree_tree_label to point to census_entries.
      await queryInterface.addColumn(
        "tree_tree_label",
        "censusEntryId",
        {
          type: Sequelize.UUID,
          references: {
            model: "census_entries",
            key: "id",
          },
        },
        { transaction }
      );

      // Grab existing tree to tree labels through table rows.
      const existingTreeTreeLabelRows = await queryInterface.sequelize.query(
        "SELECT * FROM tree_tree_label;",
        { transaction, type: Sequelize.QueryTypes.SELECT }
      );

      await Promise.all(
        existingTreeTreeLabelRows.map((existingTreeTreeLabelRow) => {
          const { treeTag, id } = existingTreeTreeLabelRow;
          const censusEntryId = treeTagToCensusEntryId[treeTag];
          return queryInterface.bulkUpdate(
            "tree_tree_label",
            {
              censusEntryId,
            },
            {
              id,
            },
            { transaction }
          );
        })
      );

      // Make tree_tree_label.censusEntryId mandatory.
      await queryInterface.changeColumn(
        "tree_tree_label",
        "censusEntryId",
        {
          type: Sequelize.UUID,
          allowNull: false,
        },
        { transaction }
      );

      // Remove tree_tree_label.treeTag.
      await queryInterface.removeColumn("tree_tree_label", "treeTag", {
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
      const censusEntryIdToTreeTag = {};
      const mostRecentCensusEntryForTree = {};

      const existingCensusEntries = await queryInterface.sequelize.query(
        "SELECT * FROM census_entries;",
        { transaction, type: Sequelize.QueryTypes.SELECT }
      );

      existingCensusEntries
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .forEach((existingCensusEntry) => {
          censusEntryIdToTreeTag[existingCensusEntry.id] =
            existingCensusEntry.treeTag;
          mostRecentCensusEntryForTree[existingCensusEntry.treeTag] =
            existingCensusEntry;
        });

      /**
       *
       * UNMIGRATE TREES TABLE
       *
       */

      // Add trees.dbh, trees.height, trees.statusName, trees.tripId, trees.authorId.
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
        "height",
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

      Object.entries(mostRecentCensusEntryForTree).map(
        ([tag, mostRecentCensusEntry]) => {
          const { dbh, height, tripId, authorId, updatedAt } =
            mostRecentCensusEntry;
          return queryInterface.bulkUpdate(
            "trees",
            {
              dbh,
              height,
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

      // Add tree_tree_label.treeTag.
      await queryInterface.addColumn(
        "tree_tree_label",
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
      const existingTreeTreeLabelRows = await queryInterface.sequelize.query(
        "SELECT * FROM tree_tree_label;",
        { transaction, type: Sequelize.QueryTypes.SELECT }
      );

      // Copy tree_tree_label.censusEntryId to tree_tree_label.treeTag.
      await Promise.all(
        existingTreeTreeLabelRows.map(async (existingTreeTreeLabelRow) => {
          const { id, censusEntryId } = existingTreeTreeLabelRow;
          await queryInterface.bulkUpdate(
            "tree_tree_label",
            {
              treeTag: censusEntryIdToTreeTag[censusEntryId],
            },
            {
              id,
            },
            { transaction }
          );
        })
      );

      // Make tree_tree_label.treeTag mandatory.
      await queryInterface.changeColumn(
        "tree_tree_label",
        "treeTag",
        {
          type: Sequelize.STRING,
          allowNull: false,
        },
        { transaction }
      );

      // Remove tree_tree_label.censusEntryId.
      await queryInterface.removeColumn("tree_tree_label", "censusEntryId", {
        transaction,
      });

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

      // Copy tree_photos.censusEntryId to tree_photos.treeTag.
      await Promise.all(
        existingTreePhotos.map(async (existingTreePhoto) => {
          const { id, censusEntryId } = existingTreePhoto;
          await queryInterface.bulkUpdate(
            "tree_photos",
            {
              treeTag: censusEntryIdToTreeTag[censusEntryId],
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

      // Remove tree_photos.censusEntryId.
      await queryInterface.removeColumn("tree_photos", "censusEntryId", {
        transaction,
      });

      /**
       *
       * UNMIGRATE CENSUS_ENTRIES TABLE
       *
       */

      await queryInterface.dropTable("census_entries", { transaction });

      await transaction.commit();
    } catch (e) {
      console.error(e);
      await transaction.rollback();
      throw e;
    }
  },
};
