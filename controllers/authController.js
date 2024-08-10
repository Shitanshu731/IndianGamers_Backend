import userModel from "../models/userModel.js";
import { comparePassword, hashPassword } from "./../helpers/authHelper.js";
import JWT from "jsonwebtoken";
import transporter from "../config/email.js";

export const registerController = async (req, res) => {
  try {
    const { name, email, answer, password, phone, address } = req.body;

    // Validations
    if (!name) return res.status(400).json({ success: false, message: "Name is required" });
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });
    if (!answer) return res.status(400).json({ success: false, message: "Answer is required" });
    if (!password) return res.status(400).json({ success: false, message: "Password is required" });
    if (!phone) return res.status(400).json({ success: false, message: "Phone number is required" });
    if (!address) return res.status(400).json({ success: false, message: "Address is required" });

    // Check if user exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(200).json({ success: false, message: "Already registered. Please log in." });
    }

    // Register user
    const hashedPassword = await hashPassword(password);
    const user = await new userModel({
      name,
      email,
      phone,
      address,
      answer,
      password: hashedPassword,
    }).save();

    // Send welcome email
    const mailOptions = {
      from: process.env.EMAILFROM,
      to: email,
      subject: "Welcome to INDIANS_GAMERS",
      text: `Hello ${name},\n\nWelcome to INDIANS_GAMERS! We're glad to have you.\n\nBest regards,\nThe Team`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email: ", error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user,
    });

  } catch (error) {
    console.error("Error during registration: ", error);
    res.status(500).json({ success: false, message: "Error in registration", error });
  }
};


//POST LOGIN
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid email or password",
      });
    }
    //check user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not registerd",
      });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid Password",
      });
    }
    //token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: "login successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        adddress: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};

//test controller
export const testController = (req, res) => {
  try {
    res.send("Protected Routes");
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
};

export const forgotPasswordController = async (req, res) => {
  try {
    const { email, newPassword, answer } = req.body;
    if (!email) res.status(404).send({ message: "Email is required" });
    if (!newPassword)
      res.status(404).send({ message: "New password is required" });
    if (!answer) res.status(404).send({ message: "answer is required" });
    const user = await userModel.findOne({ email, answer });
    
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Wrong Email or answer",
      });
    }
    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "Password Changed Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something Went Wrong.",
      error,
    });
  }
};

export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const user = await userModel.findById(req.user._id);
    if (password && password.length < 6) {
      return res.json({ error: "Password is required and 6 character long" });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile Updated Successfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .send({ success: false, message: "Error while Updating Profile", error });
  }
};
