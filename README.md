docker-compose up
npm install
npm start

Database:
mysql
host: (check with docker-machine ip [name])
user: root
password:

Crawler:
mounted . to /crawler
docker run -it facebook_crawler_1



./node_modules/.bin/sequelize model:create --force --name Page --attributes facebook_id:string,name:string,description:text,about:text,fan_count:bigint,category:string,website:string,talking_about_count:bigint

then manually add unique: true to facebook_id in the migration file

./node_modules/.bin/sequelize model:create --force --name Post --attributes 'page_id:integer,facebook_id:string,name:string,share:bigint,comment:bigint,like:bigint,love:bigint,haha:bigint,wow:bigint,sad:bigint,angry:bigint,caption:text,message:text,description:text,status_type:string,type:string,link:string(2048),full_picture:string(2048),picture:string(2048),source:string(2048),created_time:date,updated_time:date'

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

//then manually add unique: true to facebook_id in the migration file

./node_modules/.bin/sequelize db:migrate:undo
./node_modules/.bin/sequelize db:migrate

npm run 1

post.js:
var Page = require('./page'); // import
Post.belongsTo(Page); // in associate function
