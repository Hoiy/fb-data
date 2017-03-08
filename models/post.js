'use strict';
module.exports = function(sequelize, DataTypes) {
  var Post = sequelize.define('Post', {
    page_id: DataTypes.INTEGER,
    facebook_id: DataTypes.STRING,
    name: DataTypes.STRING,
    share: DataTypes.BIGINT,
    comment: DataTypes.BIGINT,
    like: DataTypes.BIGINT,
    love: DataTypes.BIGINT,
    haha: DataTypes.BIGINT,
    wow: DataTypes.BIGINT,
    sad: DataTypes.BIGINT,
    angry: DataTypes.BIGINT,
    caption: DataTypes.TEXT,
    message: DataTypes.TEXT("long"),
    description: DataTypes.TEXT,
    status_type: DataTypes.STRING,
    type: DataTypes.STRING,
    link: DataTypes.TEXT,
    full_picture: DataTypes.STRING(2048),
    picture: DataTypes.STRING(2048),
    source: DataTypes.TEXT,
    created_time: DataTypes.DATE,
    updated_time: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Post;
};
