"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // add color column
      await queryInterface.addColumn(
        "tree_species",
        "color",
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: "#3E6B4E", // green
        },
        { transaction }
      );

      // function to generate random color
      const random_color = () => {
        const hex_digits = "0123456789abcdef";
        var color = "#";
        for (var i = 0; i < 6; i++) {
          const d = Math.floor(Math.random() * hex_digits.length);
          color += hex_digits[d];
        }
        return color;
      };

      // get tree species
      const species = await queryInterface.sequelize.query(
        "SELECT code FROM tree_species;",
        { transaction, type: Sequelize.QueryTypes.SELECT }
      );

      // update each species with a random color
      if (species.length > 0) {
        await Promise.all(
          species.map((element) => {
            return queryInterface.bulkUpdate(
              "tree_species",
              { color: random_color() },
              { code: element.code },
              { transaction }
            );
          })
        );
      }
      await transaction.commit();
    } catch (err) {
      console.error(err);
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("tree_species", "color");
  },
};
