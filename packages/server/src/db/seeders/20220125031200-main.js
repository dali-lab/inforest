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

const DEMO_FOREST_ID = uuid();

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      /**
       * User Data
       */
      const demoUserIds = [uuid(), uuid(), uuid()];
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
          id: demoUserIds[0],
          email: "ziray.hao@dali.dartmouth.edu",
          password: "foo",
          firstName: "Ziray",
          lastName: "Hao",
          verified: true,
        },
        {
          id: demoUserIds[1],
          email: "julian.george@dali.dartmouth.edu",
          password: "foo",
          firstName: "Julian",
          lastName: "George",
          verified: true,
        },
        {
          id: demoUserIds[2],
          email: "miruna.palaghean@dali.dartmouth.edu",
          password: "foo",
          firstName: "Miruna",
          lastName: "Palaghean",
          verified: true,
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
      const dataSeederTeamId = uuid();
      const demoTeamId = uuid();
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
          {
            id: demoTeamId,
            name: "Demo Team",
            description:
              "Demo team for the O-Farm, conducting the 2022 demo census.",
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
          ...demoUserIds.map((id) => ({
            id: uuid(),
            teamId: demoTeamId,
            userId: id,
            role: "ADMIN",
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
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
          if (!!trees[tree.id]) {
            console.error("Duplicate tree entry", tree.tag);
          }
          trees[tree.id] = tree;
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
          name: "Census 2021",
          active: false,
          forestId: DATA_SEEDER_FOREST_ID,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: DEMO_FOREST_ID,
          name: "Census 2022 (demo)",
          active: true,
          forestId: DATA_SEEDER_FOREST_ID,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      await queryInterface.bulkInsert("forest_census", initial_forest_census, {
        transaction,
      });

      const plotCensuses = {};
      for (const plot of Object.values(plots)) {
        const censuses = [];
        censuses.push({
          id: uuid(),
          status: "APPROVED",
          plotId: plot.id,
          forestCensusId: DATA_SEEDER_FOREST_CENSUS_ID,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const random = Math.random();

        if (random < 0.4) {
        } else if (random < 0.6) {
          censuses.push({
            id: uuid(),
            status: "IN_PROGRESS",
            plotId: plot.id,
            forestCensusId: DEMO_FOREST_ID,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else if (random < 0.7) {
          censuses.push({
            id: uuid(),
            status: "PENDING",
            plotId: plot.id,
            forestCensusId: DEMO_FOREST_ID,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else {
          censuses.push({
            id: uuid(),
            status: "APPROVED",
            plotId: plot.id,
            forestCensusId: DEMO_FOREST_ID,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        plotCensuses[plot.id] = censuses;
      }

      await queryInterface.bulkInsert(
        "plot_census",
        Object.values(plotCensuses).flatMap((v) => v),
        {
          transaction,
        }
      );

      const treeCensuses = [];
      Object.values(trees).forEach((tree) => {
        const plotCensusesForTree = plotCensuses[tree.plotId];
        plotCensusesForTree.forEach((plotCensus) => {
          switch (plotCensus.status) {
            case "PENDING":
            case "APPROVED":
              treeCensuses.push({
                id: uuid(),
                treeId: tree.id,
                dbh: tree.dbh,
                authorId: DATA_SEEDER_AUTHOR_ID,
                plotCensusId: plotCensuses[tree.plotId].id,
                createdAt: tree.createdAt,
                updatedAt: tree.updatedAt,
              });
              break;
            case "IN_PROGRESS":
              if (Math.random() < 0.5) {
                treeCensuses.push({
                  id: uuid(),
                  treeId: tree.id,
                  dbh: tree.dbh,
                  authorId: DATA_SEEDER_AUTHOR_ID,
                  plotCensusId: plotCensuses[tree.plotId].id,
                  createdAt: tree.createdAt,
                  updatedAt: tree.updatedAt,
                });
              }
              break;
          }
        });
      });

      /**
       * Seed census entries.
       */
      await queryInterface.bulkInsert("tree_census", treeCensuses, {
        transaction,
      });

      /**
       * Seed tree to tree label through table rows.
       */
      await queryInterface.bulkInsert(
        "tree_census_labels",
        treeCensuses.map((treeCensus) => ({
          id: uuid(),
          treeCensusId: treeCensus.id,
          treeLabelCode: trees[treeCensus.treeId].labelCodes[0],
          createdAt: treeCensus.createdAt,
          updatedAt: treeCensus.updatedAt,
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
