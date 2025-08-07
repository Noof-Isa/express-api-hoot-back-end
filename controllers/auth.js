// // /controllers/auth.js
// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcrypt');

// const User = require('../models/user');
// const saltRounds = 12;


// // router.post('/sign-up', (req, res) => {
// //   res.json({ message: 'Sign up route' });
// // });


// router.post('/sign-up', async (req, res) => {
//   try {
//     const userInDatabase = await User.findOne({ username: req.body.username });

//     if (userInDatabase) {
//       return res.status(409).json({err:'Username already taken.'});
//     }

//     const user = await User.create({
//       username: req.body.username,
//       hashedPassword: bcrypt.hashSync(req.body.password, saltRounds)
//     });

//     res.status(201).json({ user });
//   } catch (err) {
//     // Send the error message to the client
//     res.status(500).json({ err: err.message });
//   }
// });


// module.exports = router;

const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/user');

const saltRounds = 12;

router.post('/sign-up', async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(409).json({ err: 'Username or Password is invalid' });
    }

    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    const newUser = await User.create({ username, hashedPassword });

    const payload = {
      username: newUser.username,
      _id: newUser._id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    res.status(201).json({ token });
  } catch (err) {
    res.status(400).json({ err: 'Invalid, Please try again.' });
  }
});

router.post('/sign-in', async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(401).json({ err: 'Invalid credentials.' });
    }

    // Check if the password is correct using bcrypt
    const isPasswordCorrect = bcrypt.compareSync(req.body.password, user.hashedPassword);
    // If the password is incorrect, return a 401 status code with a message
    if (!isPasswordCorrect) {
      return res.status(401).json({ err: 'Invalid credentials.' });
    }

    const payload = {
      username: user.username,
      _id: user._id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;