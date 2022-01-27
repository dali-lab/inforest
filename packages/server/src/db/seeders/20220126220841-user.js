'use strict';

const uuid = require("uuid4");

module.exports = {
  async up (queryInterface, Sequelize) {
    const robertTestUserId = uuid()
    const rebeccaTestUserId = uuid()
    await queryInterface.bulkInsert("users", [{
      id:robertTestUserId,
      email:"test@test.com",
      password:"kshdaskjdhaksjdhaksdnakjsdblakhsjdbahjsdkjad",
      firstName:"Robert",
      lastName:"Test",
      verified:false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },{
      id:rebeccaTestUserId,
      email:"fakeemail@emails.net",
      password:"asdasfgasdsdgkajsnjsndadasd",
      firstName:"Rebecca",
      lastName:"Test",
      verified:false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }])
    const happyTreeFriendsTeamId = uuid()
    await queryInterface.bulkInsert("teams", [
      {
        id:happyTreeFriendsTeamId,
        name:"Happy Tree Friends",
        description:"Just a bunch of happy tree friends who do forest censusing",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ])
    await queryInterface.bulkInsert("memberships", [
      {
        id: uuid(),
        teamId: happyTreeFriendsTeamId,
        userId: robertTestUserId,
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        teamId: happyTreeFriendsTeamId,
        userId: rebeccaTestUserId,
        role: 'MEMBER',
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
