"use strict";

const defaultTeamId = "00000000-0000-0000-0000-000000000000";
const defaultForestId = "00000000-0000-0000-0000-000000000000";
const defaultTripId = "00000000-0000-0000-0000-000000000000";
const defaultUserId = "00000000-0000-0000-0000-000000000000";
const defaultMembershipId = "00000000-0000-0000-0000-000000000000";

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Create forests table.
      await queryInterface.createTable(
        "forests",
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
          description: {
            type: Sequelize.STRING,
          },
          teamId: {
            type: Sequelize.UUID,
            references: {
              model: "teams",
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
      // Create trips table.
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

      // Check if there's already data in the database.
      const existingTrees = await queryInterface.sequelize.query(
        "SELECT COUNT(tag) FROM trees;",
        { transaction }
      );
      // If so, we need to create a default 'forest', 'trip', 'user', 'team', 'membership', since they're required fields for 'trees.tripId', 'trees,authorId', 'plots.forestId'.
      if (existingTrees[0][0].count > 0) {
        await queryInterface.bulkInsert(
          "teams",
          [
            {
              id: defaultTeamId,
              name: "Default team",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          { transaction }
        );

        await queryInterface.bulkInsert(
          "forests",
          [
            {
              id: defaultForestId,
              name: "Default forest",
              teamId: defaultTeamId,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          { transaction }
        );

        await queryInterface.bulkInsert(
          "trips",
          [
            {
              id: defaultTripId,
              name: "Default trip",
              forestId: defaultForestId,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          { transaction }
        );

        await queryInterface.bulkInsert(
          "users",
          [
            {
              id: defaultUserId,
              email: "email",
              password: "password",
              verified: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          { transaction }
        );

        await queryInterface.bulkInsert(
          "memberships",
          [
            {
              id: defaultMembershipId,
              userId: defaultUserId,
              teamId: defaultTeamId,
              role: "ADMIN",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          { transaction }
        );
      }

      // Add new columns to existing tables with default values based on temporary seed data.
      await queryInterface.addColumn(
        "trees",
        "tripId",
        {
          type: Sequelize.UUID,
          allowNull: false,
          defaultValue: defaultTripId,
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
          allowNull: false,
          defaultValue: defaultUserId,
          references: {
            model: "users",
            key: "id",
          },
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "plots",
        "forestId",
        {
          type: Sequelize.UUID,
          allowNull: false,
          defaultValue: defaultForestId,
          references: {
            model: "forests",
            key: "id",
          },
        },
        { transaction }
      );

      // Remove the default value parameters on new columns.
      await queryInterface.changeColumn(
        "trees",
        "tripId",
        {
          type: Sequelize.UUID,
          defaultValue: null,
        },
        { transaction }
      );
      await queryInterface.changeColumn(
        "trees",
        "authorId",
        {
          type: Sequelize.UUID,
          defaultValue: null,
        },
        { transaction }
      );
      await queryInterface.changeColumn(
        "plots",
        "forestId",
        {
          type: Sequelize.UUID,
          defaultValue: null,
        },
        { transaction }
      );
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
      await queryInterface.removeColumn("trees", "tripId", { transaction });
      await queryInterface.removeColumn("trees", "authorId", { transaction });
      await queryInterface.removeColumn("plots", "forestId", { transaction });
      await queryInterface.bulkDelete(
        "memberships",
        { id: defaultMembershipId },
        { transaction }
      );
      await queryInterface.bulkDelete(
        "users",
        { id: defaultUserId },
        { transaction }
      );
      await queryInterface.bulkDelete(
        "trips",
        { id: defaultTripId },
        { transaction }
      );
      await queryInterface.bulkDelete(
        "forests",
        { id: defaultForestId },
        { transaction }
      );
      await queryInterface.bulkDelete(
        "teams",
        { id: defaultTeamId },
        { transaction }
      );
      await queryInterface.dropTable("trips", { transaction });
      await queryInterface.dropTable("forests", { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
