const Users = require("../models/userModels");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  console.log(req.body);

  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter all the fields.",
    });
  }

  try {
    const existingUser = await Users.findOne({ email: email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists.",
      });
    }

    const randomSalt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, randomSalt);

    const newUser = new Users({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: encryptedPassword,
      username: email.split('@')[0] + Math.floor(Math.random() * 10000), // Example unique username
    });
    

    await newUser.save();
    res.status(201).json({
      success: true,
      message: "User created successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  console.log(req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter all fields.",
    });
  }

  try {
    const user = await Users.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist.",
      });
    }

    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials.",
      });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // optional: set token expiration
    );

    res.status(200).json({
      success: true,
      message: "User logged in successfully.",
      token: token,
      userData: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  loginUser,
};
