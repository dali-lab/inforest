"use strict";

const uuid = require("uuid4");

module.exports = {
  async up(queryInterface, Sequelize) {
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
    await queryInterface.bulkInsert("tree_status", [
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

    /**
     * Tree data.
     */
    const trees = [
      {
        tag: "04739",
        plotNumber: 1,
        speciesCode: species[0].code,
        statusName: "ALIVE",
      },
      {
        tag: "04740",
        plotNumber: 1,
        speciesCode: species[0].code,
        statusName: "ALIVE",
      },
      {
        tag: "04741",
        plotNumber: 1,
        speciesCode: species[0].code,
        statusName: "ALIVE",
      },
      {
        tag: "04742",
        plotNumber: 1,
        speciesCode: species[0].code,
        statusName: "DEAD_STANDING",
      },
      {
        tag: "04743",
        plotNumber: 1,
        speciesCode: species[0].code,
        statusName: "DEAD_STANDING",
      },
      {
        tag: "04744",
        plotNumber: 1,
        speciesCode: species[0].code,
        statusName: "DEAD_STANDING",
      },
      {
        tag: "04745",
        plotNumber: 1,
        speciesCode: species[0].code,
        statusName: "DEAD_FALLEN",
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
    await queryInterface.bulkInsert("trees", [
      {
        tag: "04746",
        plotNumber: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    await queryInterface.bulkInsert("tree_photos", [
      {
        id: uuid(),
        treeTag: trees[0].tag,
        url: "https://en.wikipedia.org/wiki/Acer_rubrum#/media/File:2014-10-30_11_09_40_Red_Maple_during_autumn_on_Lower_Ferry_Road_in_Ewing,_New_Jersey.JPG",
        type: "FULL",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        treeTag: trees[0].tag,
        url: "https://mywoodlot.com/images/blog/2019/1.10.19/image4.JPG",
        type: "BARK",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        treeTag: trees[0].tag,
        url: "https://statesymbolsusa.org/sites/statesymbolsusa.org/files/primary-images/redmapletreefallleaves.jpg",
        type: "LEAF",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        treeTag: trees[1].tag,
        url: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Acer_saccharum_1-jgreenlee_%285098070608%29.jpg",
        type: "LEAF",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("tree_photos", null, {});
    await queryInterface.bulkDelete("trees", null, {});
    await queryInterface.bulkDelete("tree_status", null, {});
    await queryInterface.bulkDelete("tree_species", null, {});
    await queryInterface.bulkDelete("plots", null, {});
  },
};
