import { user, Product } from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";
class Usercontroller {
  static UserRegistration = async (req, res) => {
    const { name, email, password, password_confirm, phone } = req.body;
    try {
      const User = await user.findOne({ email: email });
      if (User) {
        res.send({ status: "failed", message: "User already exists" });
      } else {
        if (name && email && password && password_confirm) {
          if (password === password_confirm) {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            const role =
              email === "mandalshivam962@gmail.com" ? "admin" : "user";
            const doc = new user({
              name: name,
              email: email,
              password: hashPassword,
              phone: phone,
              role,
            });
            await doc.save();
            const saved_user = await user.findOne({ email: email });
            console.log("user saved", saved_user);
            const token = jwt.sign(
              { userID: saved_user._id },
              process.env.jwt_secret_key,
              { expiresIn: "7d" }
            );
            res.cookie("shivam", token, {
              httpOnly: true,
              secure: true,
              maxAge: 1000 * 60 * 60 * 24 * 7,
              path: "/",
              sameSite: "none",
            });
            const mailOptions = {
              from: process.env.EMAILFROM,
              to: saved_user.email,
              subject: "WELCOME TO OUR SHIVAM MART",
              text: "welcome to our shivam mart here all product are avaible.",
            };
            console.log("mailOption");
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.error(error);
              } else {
                console.log("Email sent: " + info.response);
              }
            });

            res.status(200).json({
              message: "data saved",
              token: token,
              mail: "email send sucessful",
            });
          } else {
            res.send({
              status: "failed",
              message: "password and confirm password aren't match",
            });
          }
        } else {
          res.send({ status: "failed", message: "all fields are required" });
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
      res.status(400).json(err.errors);
    }
  };

  static UserLogin = async (req, res) => {
    const { email, password , loggedIn } = req.body;
    try {
      if (email && password) {
        const User = await user.findOne({ email: email });
        if (User != null) {
          const isMatch = await bcrypt.compare(password, User.password);
          if (User.email === email && isMatch) {
            const token = jwt.sign(
              { userID: User._id },
              process.env.jwt_secret_key,
              { expiresIn: "7d" }
            );
            res.cookie("shivam", token, {
              httpOnly: true,
              secure: true,
              maxAge: 1000 * 60 * 60 * 24 * 7,
              path: "/",
              sameSite: "none",
            });
            User.loggedExpire=new Date(Date.now()+1000*60*60*24*7);
            if(User.loggedExpire != Date.now()){
              User.loggedIn=true;
            }else{
              User.loggedIn=false;
            }
            

            User.save();
            res
              .status(200)
              .json({ message: "Login Sucessfull", user: User, token: token });
          } else {
            res.status(400).json({ message: "Invalid email or password" });
          }
        } else {
          res.send({ status: "failed", message: "you didn't regesister" });
        }
      } else {
        res.send({ status: "failed", message: "all Field are requried" });
      }
    } catch (err) {
      res.status(400).json({ message: "something went wrong" });
      console.log(err);
    }
  };

  
  static changeUserpassword = async (req, res) => {
    const { password, password_confirm } = req.body;
    const foundUser = await user.findById(req.user._id);

    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (password && password_confirm) {
      if (password === password_confirm) {
        const salt = await bcrypt.genSalt(10);
        const hashpassword = await bcrypt.hash(password, salt);
        await user.findByIdAndUpdate(req.user._id, {
          $set: { password: hashpassword },
        });

        const mailOptions = {
          from: process.env.EMAILFROM,
          to: foundUser.email,
          subject: "Password changed",
          text: "You sucessful change your password if you have not changed your password then you info our contact detailas",
        };
        console.log("mailOption");
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        res.status(200).json({
          message: "password are changed",
          mail: "you sucesfully change your password",
        });
      } else {
        res
          .status(400)
          .json({ message: "password and re-enter aren't match " });
      }
    } else {
      res.status(400).json({ message: "all field are requried" });
    }
  };

  static loggedUser = async (req, res) => {
    res.send({ user: req.user });
  };

  static resetPassword = async (req, res) => {
    try {
      const { email } = req.body;

      if (email) {
        const User = await user.findOne({ email: email });

        if (User) {
          const secret = User._id + process.env.JWT_SECRET_KEY;
          const token = jwt.sign({ userID: User._id }, secret, {
            expiresIn: "10m",
          });

          const link = `${process.env.frontend_url}/api/users/resetPassword/${User._id}/${token}`;
          const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: User.email,
            subject: "Shivam Mart Password Reset Link",
            text: "This mail is only for a password reset",
            html: `<a href=${link}>Click Here</a> to reset your password`,
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error(error);
              res.status(500).json({
                status: "failed",
                message: "Failed to send reset email",
              });
            } else {
              console.log("Email sent: " + info.response);
              res.status(203).json({
                status: "passed",
                message: "Email sent for your reset password",
              });
            }
          });
        } else {
          res
            .status(403)
            .json({ status: "failed", message: "Email doesn't exist" });
        }
      } else {
        res.status(403).json({ message: "Please enter your email address" });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ status: "failed", message: "Internal server error" });
    }
  };

  static userPasswordReset = async (req, res) => {
    try {
      const { password, password_confirm } = req.body;
      const { id, token } = req.params;
  
      const User = await user.findById(id);
      if (!User) {
        return res.status(404).json({ status: "failed", message: "User not found" });
      }
  
      const secret = User._id + process.env.JWT_SECRET_KEY;
  
      let decodedToken;
      try {
        decodedToken = jwt.verify(token, secret);
      } catch (err) {
        console.error("Token verification error:", err);
        return res.status(403).json({ status: "failed", message: "your session is exprie." });
      }
  
      if (decodedToken.userID !== User._id.toString()) {
        return res.status(403).json({ status: "failed", message: "Token does not match user" });
      }
  
      if (!password || !password_confirm) {
        return res.status(403).json({ message: "All fields are required" });
      }
  
      if (password !== password_confirm) {
        return res.status(403).json({ status: "failed", message: "Password and confirm password do not match" });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashpassword = await bcrypt.hash(password, salt);
  
      await user.findByIdAndUpdate(User._id, { $set: { password: hashpassword } });
  
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: User.email,
        subject: "Password changed successfully!",
        text: "You have changed your password successfully!!",
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Email send error:", error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
  
      res.status(200).json({
        status: "passed",
        message: "Password changed successfully",
        mail: "Email sent successfully",
      });
  
    } catch (err) {
      console.error("Error in userPasswordReset:", err);
      res.status(500).json({ status: "failed", message: "Internal server error" });
    }
  };
  
  
  static userDelete = async (req, res) => {
    const { id } = req.params;
    try {
      const deletedUser = await user.findByIdAndDelete(id);
      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
      res
        .status(400)
        .json({ status: "failed", message: "User was not deleted" });
    }
  };
  static UserLogout = async (req, res) => {
    const {id}=req.params
    try {
      const User=await user.findById(id)
      if(!User){
        res.status(400).json({"message":"user not found"})
      }else{
        User.loggedIn=false
        User.loggedExpire=Date.now()
        await User.save()
      }
      res.clearCookie("shivam");

      return res.status(200).json("logout");
    } catch (err) {
      return res.status(500).json(err.message);
    }
  };

  static UserEdit = async (req, res) => {
    const id = req.params.user_id;
    const User = await user.findById(id);
    const { user_name, user_phone } = req.body;
    if (!User) {
      res.status(400).json({ message: "failed" });
    } else {
      User.name = user_name;
      User.phone = user_phone;
      User.save();
      res.status(200).json({ message: "saved", User });
    }
  };
  static product = async (req, res) => {
    const { name, imageUrl, description, price, quantity } = req.body;
    try {
      const doc = new Product({
        name: name,
        imageUrl: imageUrl,
        description: description,
        price: price,
        quantity: quantity,
      });

      await doc.save();
      res.status(200).json({ message: "saved" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  static search = async (req, res) => {
    try {
      const searchTerm = req.query.q;

      if (!searchTerm) {
        return res.status(400).json({ error: "Search term is required" });
      }

      const results = await Product.find({
        $or: [
          { name: { $regex: searchTerm, $options: "i" } },
          { description: { $regex: searchTerm, $options: "i" } },
        ],
      });
      res.status(200).json({ message: "sucessul", data: results });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  static products = async (req, res) => {
    try {
      const products = await Product.find();
      res.json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  static contact = async (req, res) => {
    const { feedback, email } = req.body;
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Feedback from website",
        text: feedback,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          res.status(500).json({ error: "Error sending email" });
        } else {
          console.log("Email sent: " + info.response);
          res.status(200).json({ message: "Email sent successfully" });
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  static order_history = async (req, res) => {
    try {
      const id = req.params.userId;
      const buyProducts = req.body.products_details;
      console.log(`order_history ${JSON.stringify(buyProducts)}`);

      const User = await user.findById(id);

      if (!User) {
        return res.status(404).json({
          status: "Not Found",
          message: "User not found in our database",
        });
      }
      User.orderHistory = [...User.orderHistory, ...buyProducts];

      await User.save();

      return res.status(200).json({
        status: "Success",
        message: "Order history updated successfully",
      });
    } catch (error) {
      console.error("Error updating order history:", error);
      return res.status(500).json({
        status: "Error",
        message: "An error occurred while updating order history",
      });
    }
  };
  static userPhotoDelete = async (req, res) => {
    const id = req.params.id;
    console.log(`Received request to delete photo for user with id: ${id}`);
    
    try {
      const User = await user.findById(id);
      
      if (User) {
        console.log(`User found: ${User}`);
        User.profileImageUrl = '';
        await User.save();
        res.status(200).json({ "status": "success", "message": "Image deleted successfully" });
      } else {
        console.log(`User not found with id: ${id}`);
        res.status(404).json({ "status": "error", "message": "User not found" });
      }
    } catch (error) {
      console.error(`Error occurred: ${error.message}`);
      res.status(500).json({ "status": "error", "message": error.message });
    }
  }
  

static cartItemsadd = async (req, res) => {
  const userId = req.params.id;
  const updatedCartItems = req.body.cartItem;
  console.log(updatedCartItems)
  if (!userId || !updatedCartItems) {
    return res.status(400).json({ status: "failed", message: "Invalid input id or cart items" });
  }

  try {
    const User = await user.findById(userId);
    if (User) {
      updatedCartItems.forEach(newCartItem => {
        const existingItemIndex = User.cartItem.findIndex(item => item.id === newCartItem.id);
        if (existingItemIndex > -1) {
          User.cartItem[existingItemIndex].quantity += newCartItem.quantity;
        } else {
          User.cartItem.push(newCartItem);
        }
      });

      await User.save();
      res.status(200).json({ status: "success", message: "Cart item added successfully" });
    } else {
      res.status(404).json({ status: "failed", message: "User not found" });
    }
  } catch (error) {
    console.error("Error in cartItemsAdd:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Deleting items from the cart with logging
static cartItemsdelete = async (req, res) => {
  const userId = req.params.id;
  const itemIdsToDelete = req.body.deleteCart;
  console.log("Items to delete:", itemIdsToDelete);

  try {
    const User = await user.findById(userId);
    console.log("Fetched user:", User);

    if (User) {
      User.cartItem = User.cartItem.filter(item => !itemIdsToDelete.includes(item.id));
      await User.save();
      console.log("Updated user cart after deletion:", User.cartItem);
      res.status(200).json({ status: "success", message: "Cart item(s) deleted successfully" });
    } else {
      res.status(404).json({ status: "failed", message: "User not found" });
    }
  } catch (error) {
    console.error("Error in cartItemsdelete:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

 static cartUpdate=async(req,res)=>{
  const userId = req.params.id;
  const updatedCartItems = req.body.updateCart;

  if (!userId || !Array.isArray(updatedCartItems)) {
    return res.status(400).json({ status: "failed", message: "Invalid input" });
  }

  try {
    const User = await user.findById(userId);
    if (User) {
      User.cartItem = updatedCartItems;
      await User.save();
      res.status(200).json({ status: "success", message: "Cart updated successfully" });
    } else {
      res.status(404).json({ status: "failed", message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
 }
  
}

export default Usercontroller;

