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
