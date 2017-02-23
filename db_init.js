import Sequelize from 'sequelize'

const sequelize = new Sequelize('facebook', 'root', '', {
    host: '192.168.99.100',
    dialect: 'mysql',
})
