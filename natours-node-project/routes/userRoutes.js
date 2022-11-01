
const express = require("express");
const userController = require("./../controllers/userController")



// user routes
const router = express.Router()

router.route("/")
    .get(userController.getAllUsers)
    .post(userController.createUser)

router.route("/:id")
    .get(userController.getAllUsers)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)

module.exports = router;