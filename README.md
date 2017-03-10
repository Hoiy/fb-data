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



./node_modules/.bin/sequelize model:create --force --name Page --attributes facebook_id:string,name:string,description:text,about:text,fan_count:bigint,category:string,website:text,talking_about_count:bigint,language:string

facebook_id: {
  type: Sequelize.STRING,
  allowNull: false,
  unique: true
},

./node_modules/.bin/sequelize model:create --force --name Post --attributes 'page_id:integer,facebook_id:string,name:string,share:bigint,comment:bigint,like:bigint,love:bigint,haha:bigint,wow:bigint,sad:bigint,angry:bigint,caption:text,message:text("long"),description:text,status_type:string,type:string,link:text,full_picture:string(2048),picture:string(2048),source:text,created_time:date,updated_time:date'

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

./node_modules/.bin/sequelize db:migrate:undo
./node_modules/.bin/sequelize db:migrate

npm run 1

post.js:
var Page = require('./page'); // import
Post.belongsTo(Page); // in associate function

# Create BigQuery Table
bq mk facebook
bq mk -t facebook.pages
bq mk -t facebook.posts

# Regenerate schema
bq rm facebook.posts
bq rm facebook.pages
npm run 0
