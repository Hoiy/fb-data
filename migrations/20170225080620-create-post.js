'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Posts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      page_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Pages', key: 'id' }
      },
      facebook_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING
      },
      share: {
        type: Sequelize.BIGINT
      },
      comment: {
        type: Sequelize.BIGINT
      },
      like: {
        type: Sequelize.BIGINT
      },
      love: {
        type: Sequelize.BIGINT
      },
      haha: {
        type: Sequelize.BIGINT
      },
      wow: {
        type: Sequelize.BIGINT
      },
      sad: {
        type: Sequelize.BIGINT
      },
      angry: {
        type: Sequelize.BIGINT
      },
      caption: {
        type: Sequelize.TEXT
      },
      message: {
        type: Sequelize.TEXT("long")
      },
      description: {
        type: Sequelize.TEXT
      },
      status_type: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      link: {
        type: Sequelize.TEXT
      },
      full_picture: {
        type: Sequelize.STRING(2048)
      },
      picture: {
        type: Sequelize.STRING(2048)
      },
      source: {
        type: Sequelize.TEXT
      },
      created_time: {
        type: Sequelize.DATE
      },
      updated_time: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Posts');
  }
};
