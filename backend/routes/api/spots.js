const express = require('express');
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User, Review, ReviewImage, Spot, SpotImage, Booking, sequelize } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();
/*----------------------- Validates Spots -----------------------*/
const validatesNewSpot = [
  check('address')
    .exists({ checkFalsy: true })
    .withMessage("Street address is required"),
  check('city')
    .exists({ checkFalsy: true })
    .withMessage("City is required"),
  check('state')
    .exists({ checkFalsy: true })
    .withMessage('State is required'),
  check('country')
    .exists({ checkFalsy: true })
    .withMessage('Country is required'),
  check('lat')
    .exists({ checkFalsy: true })
    .withMessage('Latitude is not valid'),
  check('lng')
    .exists({ checkFalsy: true })
    .withMessage('Longitude is not valid'),
  check('name')
    .exists({ checkFalsy: true })
    .isLength({ max: 50 })
    .withMessage("Name must be less than 50 characters"),
  check('description')
    .exists({ checkFalsy: true })
    .withMessage("Description is required"),
  check('price')
    .exists({ checkFalsy: true })
    .withMessage("Price per day is required"),
  handleValidationErrors
];


/*-------------------- Get All Spots --------------------*/
router.get("/", async (req, res, next) => {
  const allSpots = await Spot.findAll({ include: Review }) // Turns to an arr of Spots
  let Spots = [];

  allSpots.forEach(spot => {
    let reviewArr = spot.Reviews
    let spotStars = []
    reviewArr.forEach(rev => {
      spotStars.push(rev.stars)
    })
    // console.log(spotStars)
    let averageStars = spotStars.reduce((a, b) => a + b, 0) / 2
    spot["averageStars"] = averageStars
    spot["Reviews"] = null
    Spots.push(spot)
  })




  res.json(Spots)
})

/*-------------------- Create New Spot --------------------*/
router.post("/", requireAuth,validatesNewSpot, async (req, res, next) => {
  const { address, city, state, country, lat, lng, name, description, price } = req.body
  const { user } = req;
  const newSpot = await Spot.create({
    ownerId: user.id,
    address,
    city,
    state,
    country,
    lattitude: lat,
    longitude: lng,
    name,
    description,
    price
  })

  res.json(newSpot)
})

/*---------------- Get Current Users Spots ----------------*/
router.get("/current", requireAuth, async (req, res, next) => {
  const { user } = req
  const currentUserSpots = await Spot.findAll({
    where: {
      ownerId: user.id
    }
  })
  res.json({ Spots: currentUserSpots })

})
/*---------------- Get Details of a Spot ----------------*/
router.get("/:spotId", async (req, res, next) => {
  const specificSpot = await Spot.findByPk(req.params.spotId, {
    include: [
      { model: User, as: "Owner" },
      { model: SpotImage }
    ],
    // attributes:
  })

  res.json(specificSpot)
})

/*-------------- Create New Image for a Spot --------------*/
router.post("/:spotId/images", async(req,res,next)=>{

})
/*-------------------- Edit a Spot --------------------*/
/*-------------------- Review a Spot --------------------*/

module.exports = router;