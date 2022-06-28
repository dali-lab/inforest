"use strict";

const uuid = require("uuid4");
const utm = require("utm");
const csv = require("csvtojson");
const path = require("path");

const ROOT_PLOT_LAT = 43.7348569458618;
const ROOT_PLOT_LONG = -72.2519099587406;
const NUM_PLOTS_EASTWARD = 25;
const NUM_PLOTS_NORTHWARD = 10;

const DATA_SEEDER_FOREST_ID = "53dfd605-8189-44c7-ac9a-4b6ef8a203cf";
const DATA_SEEDER_TRIP_ID = "f03c4244-55d2-4f59-b5b1-0ea595982476";
const DATA_SEEDER_AUTHOR_ID = "24ea9f85-5352-4f69-b642-23291a27ff1e";
const DATA_SEEDER_FOREST_CENSUS_ID = "7488abd6-4b1a-41ad-a5a8-042b7bc4afb2";

const INPROGRESS_FOREST_CENSUS_ID = uuid();

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      /**
       * User Data
       */
      const rebeccaTestUserId = uuid();
      const users = [
        {
          id: DATA_SEEDER_AUTHOR_ID,
          email: "agroforestry@dali.dartmouth.edu",
          password: "foo",
          firstName: "Data",
          lastName: "Seeder",
          verified: true,
        },
        {
          id: rebeccaTestUserId,
          email: "fakeemail@emails.net",
          password: "asdasfgasdsdgkajsnjsndadasd",
          firstName: "Rebecca",
          lastName: "Test",
          verified: false,
        },
      ];
      await queryInterface.bulkInsert(
        "users",
        users.map((user) => ({
          ...user,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        { transaction }
      );
      const dataSeederTeamId = "ac24c415-a773-40b1-ab0e-5f87db21d396";
      await queryInterface.bulkInsert(
        "teams",
        [
          {
            id: dataSeederTeamId,
            name: "Data Seeder Team",
            description:
              "Default seed data. Do not delete. This team is used to seed the database with data.",
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
            id: uuid(),
            teamId: dataSeederTeamId,
            userId: DATA_SEEDER_AUTHOR_ID,
            role: "ADMIN",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        { transaction }
      );

      /**
       * Forests & Trips
       */
      await queryInterface.bulkInsert(
        "forests",
        [
          {
            id: DATA_SEEDER_FOREST_ID,
            name: "Dartmouth O-Farm",
            description: "Dartmouth O-Farm forest.",
            teamId: dataSeederTeamId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        { transaction }
      );
      // await queryInterface.bulkInsert(
      //   "trips",
      //   [
      //     {
      //       id: DATA_SEEDER_TRIP_ID,
      //       name: "Data Seeder Trip",
      //       forestId: DATA_SEEDER_FOREST_ID,
      //       createdAt: new Date(),
      //       updatedAt: new Date(),
      //     },
      //   ],
      //   { transaction }
      // );

      const rows = await csv().fromFile(
        path.resolve(__dirname, "initial-forest-data.csv")
      );

      /**
       * Plot data.
       */
      const plots = {};
      const ROOT_PLOT_UTM = utm.fromLatLon(ROOT_PLOT_LAT, ROOT_PLOT_LONG);
      for (let i = 0; i < NUM_PLOTS_EASTWARD; i += 1) {
        for (let j = 0; j < NUM_PLOTS_NORTHWARD; j += 1) {
          const { latitude, longitude } = utm.toLatLon(
            ROOT_PLOT_UTM.easting + i * 20,
            ROOT_PLOT_UTM.northing - j * 20,
            ROOT_PLOT_UTM.zoneNum,
            ROOT_PLOT_UTM.zoneLetter
          );
          plots[`${j >= 10 ? j : `0${j}`}${i >= 10 ? i : `0${i}`}`] = {
            id: uuid(),
            number: `${j >= 10 ? j : `0${j}`}${i >= 10 ? i : `0${i}`}`,
            latitude,
            longitude,
            length: 20,
            width: 20,
            forestId: DATA_SEEDER_FOREST_ID,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }
      }
      await queryInterface.bulkInsert("plots", Object.values(plots), {
        transaction,
      });

      const trees = {};
      const species = {};
      const labels = {
        B: "large buttress, requiring ladder to measure",
        M: "multiple stems",
        A: "POM at alternative height, not breast height",
        I: "stem irregular where measured",
        P: "any problem requiring further attention",
        L: "stem leaning",
        Q: "stem broken above breast height",
        X: "stem broken below breast height",
        C: "POM has changed since prior census",
        Y: "prostrate stem",
        R: "resprout (main stem broken but resprouted since last census)",
        DS: "dead, stem standing",
        DC: "dead, stem fallen",
        DT: "dead, only tag found",
        DN: "presumed dead, no tag nor stem",
      };
      rows.forEach((row) => {
        const tree = {};
        const {
          Quadrat,
          Date: date,
          Tag,
          Species,
          DBH,
          local_x,
          local_y,
          Code,
          ["Scientific Name"]: scientificName,
          ["Common Name"]: commonName,
          Family,
          Type,
        } = row;
        if (Quadrat in plots) {
          const plot = plots[Quadrat];
          tree.id = uuid();
          tree.tag = Tag;
          tree.plotId = plot.id;
          if (!species[Species]) {
            species[Species] = {
              code: Species,
              family: Family,
              genus: scientificName.split(" ")[0],
              name: scientificName.split(" ")[1],
              commonName,
              type: Type.toUpperCase(),
            };
          }
          tree.speciesCode = Species;
          tree.dbh = parseFloat(DBH);
          tree.plotX = parseFloat(local_x);
          tree.plotY = parseFloat(local_y);
          const plotUtm = utm.fromLatLon(plot.latitude, plot.longitude);
          const { latitude, longitude } = utm.toLatLon(
            plotUtm.easting + tree.plotY,
            plotUtm.northing - tree.plotX,
            plotUtm.zoneNum,
            plotUtm.zoneLetter
          );
          tree.latitude = latitude;
          tree.longitude = longitude;
          tree.createdAt = new Date(date);
          tree.updatedAt = tree.createdAt;
          tree.labelCodes = Code in labels ? [Code] : ["P"];
          tree.tripId = DATA_SEEDER_TRIP_ID;
          tree.authorId = DATA_SEEDER_AUTHOR_ID;
          if (!!trees[tree.tag]) {
            console.error("Duplicate tree entry", tree.tag);
          }
          trees[tree.tag] = tree;
        }
      });

      /**
       * Tree metadata.
       */
      await queryInterface.bulkInsert(
        "tree_species",
        Object.values(species).map((s) => ({
          ...s,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        { transaction }
      );

      const treePurposes = ["FULL", "CANOPY", "BARK", "LEAF", "SOIL"];
      await queryInterface.bulkInsert(
        "tree_photo_purposes",
        treePurposes.map((name) => ({
          name,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        { transaction }
      );

      await queryInterface.bulkInsert(
        "tree_labels",
        Object.entries(labels).map(([code, description]) => ({
          code,
          description,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        { transaction }
      );

      /**
       * Seed trees.
       */
      await queryInterface.bulkInsert(
        "trees",
        Object.values(trees).map((tree) => ({
          id: tree.id,
          tag: tree.tag,
          plotId: tree.plotId,
          latitude: tree.latitude,
          longitude: tree.longitude,
          plotX: tree.plotX,
          plotY: tree.plotY,
          speciesCode: tree.speciesCode,
          createdAt: tree.createdAt,
          updatedAt: tree.updatedAt,
        })),
        {
          transaction,
        }
      );

      const initial_forest_census = [
        {
          id: DATA_SEEDER_FOREST_CENSUS_ID,
          name: "Imported O-Farm Data",
          active: false,
          forestId: DATA_SEEDER_FOREST_ID,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: INPROGRESS_FOREST_CENSUS_ID,
          name: "Seeder In Progress",
          active: true,
          forestId: DATA_SEEDER_FOREST_ID,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      await queryInterface.bulkInsert("forest_census", initial_forest_census, {
        transaction,
      });

      const plotCensusIds = [];
      const plot_censuses = {};
      for (const plot of Object.values(plots)) {
        const id = uuid();
        plotCensusIds.push(id);
        plot_censuses[plot.id] = {
          id,
          status: "APPROVED",
          plotId: plot.id,
          forestCensusId: DATA_SEEDER_FOREST_CENSUS_ID,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      const inprogress_plot_censuses = {};
      for (let i = 12; i < Math.floor(Object.values(plots).length / 2); i++) {
        const id = uuid();
        plotCensusIds.push(id);
        const plot = Object.values(plots)[i];
        inprogress_plot_censuses[plot.id] = {
          id,
          status: "IN_PROGRESS",
          plotId: plot.id,
          forestCensusId: INPROGRESS_FOREST_CENSUS_ID,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      await queryInterface.bulkInsert(
        "plot_census",
        Object.values(plot_censuses),
        {
          transaction,
        }
      );

      await queryInterface.bulkInsert(
        "plot_census",
        Object.values(inprogress_plot_censuses),
        {
          transaction,
        }
      );

      await queryInterface.bulkInsert(
        "plot_census_assignment",
        plotCensusIds.map((plotCensusId) => ({
          id: uuid(),
          plotCensusId,
          userId: DATA_SEEDER_AUTHOR_ID,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        {
          transaction,
        }
      );

      const treeTagToTreeCensusId = {};

      const tree_censuses = Object.values(trees).map((tree) => {
        treeTagToTreeCensusId[tree.tag] = uuid();
        return {
          id: treeTagToTreeCensusId[tree.tag],
          treeId: tree.id,
          dbh: tree.dbh,
          authorId: DATA_SEEDER_AUTHOR_ID,
          plotCensusId: plot_censuses[tree.plotId].id,
          createdAt: tree.createdAt,
          updatedAt: tree.updatedAt,
        };
      });

      /**
       * Seed census entries.
       */
      await queryInterface.bulkInsert("tree_census", tree_censuses, {
        transaction,
      });

      await Promise.all(
        tree_censuses.map(async (tree_census) => {
          await queryInterface.sequelize.query(
            `UPDATE trees SET "initCensusId" = '${tree_census.id}' WHERE id = '${tree_census.treeId}'`
          );
        })
      );

      /**
       * Seed tree to tree label through table rows.
       */
      await queryInterface.bulkInsert(
        "tree_census_labels",
        Object.values(trees).map((tree) => ({
          id: uuid(),
          treeCensusId: treeTagToTreeCensusId[tree.tag],
          treeLabelCode: tree.labelCodes[0],
          createdAt: tree.createdAt,
          updatedAt: tree.updatedAt,
        })),
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
      await queryInterface.bulkDelete("memberships", null, { transaction });
      await queryInterface.bulkDelete("tree_photos", null, { transaction });
      await queryInterface.bulkDelete("tree_photo_purposes", null, {
        transaction,
      });
      await queryInterface.bulkDelete("tree_census_labels", null, {
        transaction,
      });
      await queryInterface.bulkDelete("tree_census", null, { transaction });
      await queryInterface.bulkDelete("plot_census_assignment", null, {
        transaction,
      });
      await queryInterface.bulkDelete("plot_census", null, { transaction });
      await queryInterface.bulkDelete("forest_census", null, { transaction });
      await queryInterface.bulkDelete("trees", null, { transaction });
      await queryInterface.bulkDelete("tree_species", null, { transaction });
      await queryInterface.bulkDelete("tree_labels", null, { transaction });
      await queryInterface.bulkDelete("users", null, { transaction });
      await queryInterface.bulkDelete("plots", null, { transaction });
      await queryInterface.bulkDelete("forests", null, { transaction });
      await queryInterface.bulkDelete("teams", null, { transaction });
      await transaction.commit();
    } catch (err) {
      console.error(err);
      await transaction.rollback();
      throw err;
    }
  },
};
