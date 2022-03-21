const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD, {
    host: 'localhost',
    dialect: 'mysql'
});

module.exports = sequelize;