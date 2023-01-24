const express = require("express");
const tourController = require("./../controllers/tourController")

// defined routes
const router = express.Router()

// router.param("id", tourController.checkID);

//Alias route
router.route("/top-5-cheap").
    get(tourController.aliasTopTours, tourController.getAllTours)

//aggregation route
router.route("/tour-stats").
    get(tourController.getTourStats)

//aggregation route
router.route("/monthly-plan/:year").
    get(tourController.getMonthlyPlan)


// create and get tours route
router.route("/")
    .get(tourController.getAllTours)
    .post(tourController.checkBody, tourController.createTours)

//get single, update and delete tour route
router.route("/:id")
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour)

module.exports = router