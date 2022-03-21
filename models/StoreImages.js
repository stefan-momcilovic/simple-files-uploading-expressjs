const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("./../database/config");

const StoreImages = sequelize.define("storeImages", {
    images: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
        validate: {
            notEmpty: true,
            notNull: true,
        }
    }
}, {
    timestamps: true
});

module.exports = {
    StoreImages
};