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
    await queryInterface.bulkInsert("teams", [
      {
        id:uuid(),
        name:"Happy Tree Friends",
        description:"Just a bunch of happy tree friends who do forest censusing",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ])
    const users = await queryInterface.sequelize.query(
      `SELECT id from USERS;`
    );
    const teams = await queryInterface.sequelize.query('SELECT id from TEAMS');
    console.log(users,teams)
    await queryInterface.bulkInsert("memberships", [
      {
        userId: users[0][0].id,
        teamId:teams[0][0].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: users[0][1].id,
        teamId:teams[0][0].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    queryInterface.bulkDelete("teams", null, {});
    queryInterface.bulkDelete("users", null, {});
    queryInterface.bulkDelete("memberships", null, {});

  }
};
