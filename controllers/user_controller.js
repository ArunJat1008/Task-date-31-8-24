const UserModel = require("../models/user_model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Validator = require("node-input-validator");
const RequestResetPasswordModel = require("../models/reset_password_request_model");
const moment = require("moment");

exports.signUp = async (req, res, next) => {
  const validator = new Validator.Validator(req.body, {
    firstName: "required|string",
    lastName: "required|string",
    email: "required|email",
    password: "required|string",
  });

  const matched = await validator.check();

  if (!matched) {
    const error = Object.values(validator.errors)[0].message;
    return res.status(400).json({ success: false, message: error });
  }

  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;

  try {
    let data = await UserModel.findOne({ where: { email } });

    if (data) {
      return res
        .status(400)
        .json({ success: false, message: "Existing email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    data = await UserModel.create({
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: hashedPassword,
    });

    return res
      .status(201)
      .json({ success: true, message: "Created successfully", data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res, next) => {
  const validator = new Validator.Validator(req.body, {
    email: "required|email",
    password: "required|string",
  });

  const matched = await validator.check();

  if (!matched) {
    const error = Object.values(validator.errors)[0].message;
    return res.status(400).json({ success: false, message: error });
  }

  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await UserModel.findOne({ where: { email } });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Email not exist" });
    }

    const hasValidPassword = await bcrypt.compare(
      password,
      user.dataValues.password
    );

    if (!hasValidPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign({ id: user.dataValues.id }, process.env.SECRET_KEY, {
      expiresIn: "365d",
    });

    delete user.dataValues.password;

    return res.status(200).json({
      success: true,
      message: "Login successfully",
      data: { ...user.dataValues, token },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyProfile = async (req, res, next) => {
  const id = req.query.id;
  try {
    const user = await UserModel.findOne({
      attributes: { exclude: ["password"] },
      where: { id },
    });
    return res.status(200).json({
      success: true,
      message: "myprofile",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.requestResetPassword = async (req, res, next) => {
  const validator = new Validator.Validator(req.body, {
    email: "required|email",
  });

  const matched = await validator.check();

  if (!matched) {
    const error = Object.values(validator.errors)[0].message;
    return res.status(400).json({ success: false, message: error });
  }

  const email = req.body.email;

  try {
    const user = await UserModel.findOne({ where: { email } });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Email not exist" });
    }

    const requestExpriryTime = moment().utc().add(5, "minutes");

    const createRequest = await RequestResetPasswordModel.create({
      user_id: user.dataValues.id,
      expires_at: requestExpriryTime,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset link has been send to your email",
      data: { requestId: createRequest.dataValues.id },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetPassword = async (req, res, next) => {
  const validator = new Validator.Validator(req.body, {
    requestId: "required|integer",
    password: "required|string",
  });

  const matched = await validator.check();

  if (!matched) {
    const error = Object.values(validator.errors)[0].message;
    return res.status(400).json({ success: false, message: error });
  }

  const requestId = req.body.requestId;
  const password = req.body.password;

  try {
    const data = await RequestResetPasswordModel.findOne({
      where: { id: requestId },
    });

    const currentTime = moment().utc();

    if (data.dataValues.expires_at < currentTime) {
      return res
        .status(400)
        .json({ success: false, message: "Link has expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.update(
      { password: hashedPassword },
      { where: { id: data.dataValues.user_id } }
    );

    return res.status(200).json({
      success: true,
      message: "Your password has been updated successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
