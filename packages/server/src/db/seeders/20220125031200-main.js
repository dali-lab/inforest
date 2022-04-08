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
      const dataSeederTeamId = uuid();
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
      await queryInterface.bulkInsert(
        "trips",
        [
          {
            id: DATA_SEEDER_TRIP_ID,
            name: "Data Seeder Trip",
            forestId: DATA_SEEDER_FOREST_ID,
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
          ["Scientific Name"]: scientificName,
          ["Common Name"]: commonName,
          Family,
          Type,
        } = row;
        tree.plotNumber = Quadrat;
        if (tree.plotNumber in plots) {
          const plot = plots[tree.plotNumber];
          tree.tag = Tag;
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
          tree.statusName = "ALIVE";
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
      await queryInterface.bulkInsert(
        "tree_statuses",
        [
          {
            name: "ALIVE",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: "DEAD_STANDING",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: "DEAD_FALLEN",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
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

      /**
       * Tree data.
       */
      await queryInterface.bulkInsert("trees", Object.values(trees), {
        transaction,
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
      await queryInterface.bulkDelete("memberships", null, { transaction });
      await queryInterface.bulkDelete("tree_photos", null, { transaction });
      await queryInterface.bulkDelete("tree_photo_purposes", null, {
        transaction,
      });
      await queryInterface.bulkDelete("trees", null, { transaction });
      await queryInterface.bulkDelete("tree_species", null, { transaction });
      await queryInterface.bulkDelete("tree_statuses", null, { transaction });
      await queryInterface.bulkDelete("users", null, { transaction });
      await queryInterface.bulkDelete("plots", null, { transaction });
      await queryInterface.bulkDelete("trips", null, { transaction });
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
