"use strict";

const uuid = require("uuid4");

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * User Data
     */
    const robertTestUserId = uuid();
    const rebeccaTestUserId = uuid();
    const users = [
      {
        id: robertTestUserId,
        email: "test@test.com",
        password: "kshdaskjdhaksjdhaksdnakjsdblakhsjdbahjsdkjad",
        firstName: "Robert",
        lastName: "Test",
        verified: false,
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
      }))
    );
    const happyTreeFriendsTeamId = uuid();
    await queryInterface.bulkInsert("teams", [
      {
        id: happyTreeFriendsTeamId,
        name: "Happy Tree Friends",
        description:
          "Just a bunch of happy tree friends who do forest censusing",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    await queryInterface.bulkInsert("memberships", [
      {
        id: uuid(),
        teamId: happyTreeFriendsTeamId,
        userId: robertTestUserId,
        role: "ADMIN",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        teamId: happyTreeFriendsTeamId,
        userId: rebeccaTestUserId,
        role: "MEMBER",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    /**
     * Forests & Trips
     */
    const testOFarmForestId = uuid();
    await queryInterface.bulkInsert("forests", [
      {
        id: testOFarmForestId,
        name: "Test O-Farm",
        description: "This is a test forest added by the seeder",
        teamId: happyTreeFriendsTeamId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    const testTripId = uuid();
    await queryInterface.bulkInsert("trips", [
      {
        id: testTripId,
        name: "First Test Trip",
        forestId: testOFarmForestId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    /**
     * Plot data.
     */
    await queryInterface.bulkInsert("plots", [
      {
        number: 1,
        name: "Plot 1",
        lat: 43.73,
        long: -72.25,
        length: 20,
        width: 20,
        forestId: testOFarmForestId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        number: 2,
        name: "Plot 2",
        lat: 43.731,
        long: -72.251,
        length: 20,
        width: 20,
        forestId: testOFarmForestId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    /**
     * Tree metadata.
     */
    const species = [
      {
        code: "ACERUB",
        genus: "Acer",
        name: "Rubrum",
        commonName: "Red maple",
      },
      {
        code: "ACESAC",
        genus: "Acer",
        name: "Saccharum",
        commonName: "Sugar maple",
      },
      {
        code: "PINSTO",
        genus: "Pinus",
        name: "Strobus",
        commonName: "Eastern white pine",
      },
      {
        code: "POPTRE",
        genus: "Populus",
        name: "Tremuloides",
        commonName: "Quaking aspen",
      },
      {
        code: "QUEABU",
        genus: "Quercus",
        name: "Albalus",
        commonName: "White oak",
      },
    ];
    await queryInterface.bulkInsert(
      "tree_species",
      species.map((s) => ({
        ...s,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
    await queryInterface.bulkInsert("tree_statuses", [
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
    ]);
    const treePurposes = ["FULL", "CANOPY", "BARK", "LEAF", "SOIL"];
    await queryInterface.bulkInsert(
      "tree_photo_purposes",
      treePurposes.map((name) => ({
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );

    /**
     * Tree data.
     */
    const trees = [
      {
        tag: "04739",
        plotNumber: 1,
        speciesCode: species[0].code,
        statusName: "ALIVE",
        tripId: testTripId,
        authorId: rebeccaTestUserId,
      },
      {
        tag: "04740",
        plotNumber: 1,
        speciesCode: species[0].code,
        statusName: "ALIVE",
        tripId: testTripId,
        authorId: rebeccaTestUserId,
      },
      {
        tag: "04741",
        plotNumber: 1,
        speciesCode: species[0].code,
        statusName: "ALIVE",
        tripId: testTripId,
        authorId: rebeccaTestUserId,
      },
      {
        tag: "04742",
        plotNumber: 1,
        speciesCode: species[0].code,
        statusName: "DEAD_STANDING",
        tripId: testTripId,
        authorId: robertTestUserId,
      },
      {
        tag: "04743",
        plotNumber: 1,
        speciesCode: species[0].code,
        statusName: "DEAD_STANDING",
        tripId: testTripId,
        authorId: robertTestUserId,
      },
      {
        tag: "04744",
        plotNumber: 1,
        speciesCode: species[0].code,
        statusName: "DEAD_STANDING",
        tripId: testTripId,
        authorId: robertTestUserId,
      },
      {
        tag: "04745",
        plotNumber: 1,
        speciesCode: species[0].code,
        statusName: "DEAD_FALLEN",
        tripId: testTripId,
        authorId: robertTestUserId,
      },
    ];
    const genTreeFields = () => ({
      lat: 43.73 + Math.random() * 0.001,
      long: -(72.25 + Math.random() * 0.001),
      plotX: Math.random() * 20,
      plotY: Math.random() * 20,
      dbh: Math.random() * 5,
      height: Math.random() * 30,
    });
    await queryInterface.bulkInsert(
      "trees",
      trees.map((t) => ({
        ...genTreeFields(),
        ...t,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
    await queryInterface.bulkInsert("tree_photos", [
      {
        id: uuid(),
        treeTag: trees[0].tag,
        url: "https://en.wikipedia.org/wiki/Acer_rubrum#/media/File:2014-10-30_11_09_40_Red_Maple_during_autumn_on_Lower_Ferry_Road_in_Ewing,_New_Jersey.JPG",
        purposeName: "FULL",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        treeTag: trees[0].tag,
        url: "https://mywoodlot.com/images/blog/2019/1.10.19/image4.JPG",
        purposeName: "BARK",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        treeTag: trees[0].tag,
        url: "https://statesymbolsusa.org/sites/statesymbolsusa.org/files/primary-images/redmapletreefallleaves.jpg",
        purposeName: "LEAF",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        treeTag: trees[1].tag,
        url: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Acer_saccharum_1-jgreenlee_%285098070608%29.jpg",
        purposeName: "LEAF",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("tree_photos", null, {});
    await queryInterface.bulkDelete("trees", null, {});
    await queryInterface.bulkDelete("tree_statuses", null, {});
    await queryInterface.bulkDelete("tree_species", null, {});
    await queryInterface.bulkDelete("plots", null, {});
    await queryInterface.bulkDelete("teams", null, {});
    await queryInterface.bulkDelete("users", null, {});
    await queryInterface.bulkDelete("memberships", null, {});
  },
};
