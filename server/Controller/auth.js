const User = require('../Models/User')
const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { log } = require('console');

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: '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'
    }
  })
);

const salt = bcrypt.genSaltSync(10);
 
exports.register = async (req, res, next) => {
  const { name, email, password } = req.body;
  
  try {
    const existingUser = await User.findOne({ email });
      if (existingUser) {
       
          return res.status(422).json({ error: 'Email already registered' });
      }
      const newUser = await User.create({
          name,
          email,
          password: bcrypt.hashSync(password, salt)
      },
      
    
      );
    
      res.json(newUser);
  } catch (e) {
      res.status(422).json(e);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  const userDoc = await User.findOne({ email });

  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      const token = jwt.sign(
        {
          id: userDoc._id,
          email: userDoc.email,
          isAdmin: userDoc.isAdmin, 
          name:userDoc.name
        },
        "ILOVEANNA",
        { expiresIn: '1h' }
      );
    
      res
        .cookie("token", token, {
          httpOnly: true,
        })
        .json(userDoc);
    } else {
    
      res.status(422).json({ error: 'Incorrect email or password' });
    }
  } else {
   
    res.status(422).json({ error: 'Incorrect email or password' });
  }
};

exports.profile = async (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, "ILOVEANNA", {}, async (err, userData) => {
      if (err) {
       
        res.clearCookie('token').json({ error: 'Token expired or invalid. Please log in again.' });
      } else {
        const { name, email, _id, isAdmin } = await User.findById(userData.id);
        res.json({ name, email, _id, isAdmin });
      }
    });
  } else {
    res.json(null);
  }
}

exports.logout = async(req, res) => {
  res.clearCookie('token').json(true);
}

exports.postReset = async (req, res, next) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        console.error(err);
        return res.status(500).send('An error occurred');
      }
      
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(404).send('User not found');
      }
      const token = jwt.sign({ userId: user._id }, "ILOVEANNA", {expiresIn: "10m",});
      

   
      await user.save();

     
      res.status(200).json({ message: 'Password reset requested', userId: user._id });
      console.log("yser", user);
      
   
      transporter.sendMail({
        to: req.body.email,
        from: 'vaqsii23@gmail.com',
        subject: 'Password reset',
        html: `
          <p>You requested a password reset</p>
          <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
        `
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
};




exports.NewPassword = async (req, res, next) => {
  try {
  
    const decodedToken = jwt.verify(
      req.params.token,
      "ILOVEANNA"
    );

   
    if (!decodedToken) {
      return res.status(401).send({ message: "Invalid token" });
    }

    
    const user = await User.findOne({ _id: decodedToken.userId });
    if (!user) {
      return res.status(401).send({ message: "no user found" });
    }
    

    console.log(user);
  
    const salt = await bcrypt.genSalt(10);
    req.body.newPassword = await bcrypt.hash(req.body.newPassword, salt);

  
    user.password = req.body.newPassword;
    await user.save();

 
    res.status(200).send({ message: "Password updated" });
  } catch (err) {
 
    res.status(500).send({ message: err.message });
  }
}


