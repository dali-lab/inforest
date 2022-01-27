'use strict';

const uuid = require("uuid4");

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert("users", [{
      id:uuid(),
      email:"test@test.com",
      password:"kshdaskjdhaksjdhaksdnakjsdblakhsjdbahjsdkjad",
      firstName:"Robert",
      lastName:"Test",
      verified:false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },{
      id:uuid(),
      email:"fakeemail@emails.net",
      password:"asdasfgasdsdgkajsnjsndadasd",
      firstName:"Rebecca",
      lastName:"Test",
      verified:false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }])
    let e = await queryInterface.bulkInsert("teams", [
      {
        id:uuid(),
        name:"Happy Tree Friends",
        description:"Just a bunch of happy tree friends who do forest censusing",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ])
    // TODO properly seed Many2Many memberships
  },

  async down (queryInterface, Sequelize) {
    queryInterface.bulkDelete("teams", null, {});
    queryInterface.bulkDelete("users", null, {});
    queryInterface.bulkDelete("memberships", null, {});
  }
};
