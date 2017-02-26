'use strict';
module.exports = function(sequelize, DataTypes) {
  var Page = sequelize.define('Page', {
    facebook_id: DataTypes.STRING,
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    about: DataTypes.TEXT,
    fan_count: DataTypes.BIGINT,
    category: DataTypes.STRING,
    website: DataTypes.TEXT,
    talking_about_count: DataTypes.BIGINT,
    language: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Page;
};
