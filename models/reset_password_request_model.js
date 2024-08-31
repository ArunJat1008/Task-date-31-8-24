const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");
const UserModel = require("../models/user_model");

const model = sequelize.define("reset_password_request", {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

UserModel.hasMany(model, { foreignKey: "user_id" });
model.belongsTo(UserModel, { foreignKey: "user_id" });   

module.exports = model;
