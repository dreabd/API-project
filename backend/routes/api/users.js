const express = require('express');
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

/*----------------------- Validates Sign Up -----------------------*/
const validateSignup = [
  check('email')
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid email.'),
  check('username')
    .exists({ checkFalsy: true })
    .isLength({ min: 4 })
    .withMessage('Please provide a username with at least 4 characters.'),
  check('username')
    .not()
    .isEmail()
    .withMessage('Username cannot be an email.'),
  check('firstName')
    .exists({ checkFalsy: true }),
  check('lastName')
    .exists({ checkFalsy: true }),
  check('password')
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Password must be 6 characters or more.'),
  handleValidationErrors
];

/*----------------------- Signs Up New Users -----------------------*/
router.post('/', validateSignup, async (req, res) => {
  // Gets the infor from req.body
  const { email, password, username, firstName, lastName } = req.body;
  // Hashes the password
  const hashedPassword = bcrypt.hashSync(password);
  // creates and saves a new instance of user
  const user = await User.create({ email, username, hashedPassword, firstName, lastName });

  // creates obj for set token cookie function
  const safeUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
  };

  // creates a cookie for the user
  await setTokenCookie(res, safeUser);

  // sends the info
  return res.json({
    user: safeUser
  });
});



module.exports = router;
