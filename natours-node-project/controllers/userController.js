const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");


//FILTER METHOD TO FILTER BODY FIELD
const filterObject = (obj, ...allowedField) => {
    const newObj = {};

    Object.keys(obj).forEach((itm) => {
        if (allowedField?.includes(itm)) {
            newObj[itm] = obj[itm]
        }
    });
    console.log("newObj ::", newObj)
    return newObj;
}

//get users
exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();
    res.status(200).send({
        status: "success",
        data: {
            users
        }
    });
})


exports.updateMe = catchAsync(async (req, res, next) => {
    // CREATE ERROR IF USER POST PASSWORD DATA
    if (req.body.password || req.body.confirmPassword) {
        next(new AppError("This route is not for updating password. Please use updateMyPassword route", 401))
    }

    //FILTER UNWANTED DATA THAT ARE NOT ALLOWED TO UPDATE 
    const filteredBody = filterObject(req.body, "email", "name", "active");
    
    // THEN UPDATE USER DATA
    const updateUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
        new: true,
        runValidators: true,
    });
    // const user = await User.findOne(req.user._id);

    if (!updateUser) {
        next(new AppError("the are not available of posted email"))
    }

    // user.email = req?.body?.email;
    // user.name = req?.body?.name;

    // await user.save({ validateBeforeSave: false });

    res.status(200).json({
        status: "success",
        data: {
            user: updateUser
        }
    })

});


exports.deleteMe = catchAsync(async (req, res, next) => {
   
    const user = await User.findOneAndUpdate(req?.user?._id, { active: false });

    res.status(204).send({
        status: "success",
        message: "user deleted successfully",
        data: {
            user
        }
    })
})

//create users
exports.createUser = (req, res) => {
    res.status(500).send({
        status: "error",
        message: "this route is not yet implemented!"
    });
}


//update users
exports.updateUser = (req, res) => {
    res.status(500).send({
        status: "error",
        message: "this route is not yet implemented!"
    });
}


//delete users
exports.deleteUser = (req, res) => {
    res.status(500).send({
        status: "error",
        message: "this route is not yet implemented!"
    });
}