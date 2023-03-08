const jwt = require("jsonwebtoken");
const crypto = require("crypto")
const { decode } = require("punycode");
const { promisify } = require("util")
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const sendEmail = require("../utils/email");

//CREATE JWT TOKEN HERE
const jwtTokenSing = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRETE, { expiresIn: process.env.JWT_EXPIRE_IN })
}

//SEND TOKEN TO USER
const createSendToken = (user, statusCode, res) => {
    const token = jwtTokenSing(user?._id)
const cookieOptions =  {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
    // secure: true,
}

if (process.env.NODE_ENV.trim() === "production") cookieOptions.secure = true;
    //SEND TOKEN COOKIE
    res.cookie("jwt", token, cookieOptions);

    //REMOVE THE PASSWORD FROM OUTPUT
    user.password = undefined


    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user
        }
    })
}

//SIGNUP USERS
exports.signup = catchAsync(async (req, res, next) => {

    // const newUser = await user.create(req.body);
    const newUser = await User.create({
        name: req?.body?.name,
        email: req?.body?.email,
        password: req?.body?.password,
        confirmPassword: req?.body?.confirmPassword,
        passwordChangedAt: req?.body?.passwordChangedAt,
        roles: req?.body?.roles
    });


    createSendToken(newUser, 201, res)

    // const token = jwtTokenSing(newUser?._id)
    // res.status(201).json({
    //     status: "success",
    //     token,
    //     data: {
    //         user: newUser
    //     }
    // })
});

// LOGIN USER 
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    //  CHECK EMAIL AND PASSWORD ARE EXIST
    if (!email || !password) {
        return next(new AppError("please provide email and password!", 400))
    }


    //CHECK EMAIL IF USER EXIST AND PASSWORD CORRECT
    const user = await User.findOne({ email }).select("+password");

    //COMPARE NORMAL PASSWORD TO ENCRYPTED PASSWORD
    // const correct = await user.correctPassword(password, user.password)

    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError("Incorrect email or password!", 401))
    }

    //IF EVERYTHING OK SO SEND TOKEN TO CLIENT 

    createSendToken(user, 200, res)

    // const token = jwtTokenSing(user?._id);
    // res.status(200).json({
    //     status: "success",
    //     token,
    //     user
    // })

});

// PROTECT ROUTE
exports.protect = catchAsync(async (req, res, next) => {

    //GETTING TOKENG CHECK IT EXIST OR NOT
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        next(new AppError("Your are not logged in, Please login to access tours", 401))
    }

    // TOKE VERIFICATION 
    const verifyToken = promisify(jwt.verify);
    const decoded = await verifyToken(token, process.env.JWT_SECRETE)
    // const verifyToken = await promisify(jwt.verify)(token, process.env.JWT_SECRETE)

    //CHECK USER STILL EXIST
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError("The user belonging to this toke does not exist", 401))
    }



    //CHECK IF THE USER CHANGED PASSWORD AFTER THE TOKEN WAS ISSUED
    const isChange = currentUser.changedPasswordAfter(decoded.iat);

    if (isChange) {
        return next(new AppError("User recently change password. please login again", 401))
    }

    // GRANTED ACCESS TO PROTECTED ROLES
    req.user = currentUser;
    next();

})

//ASSIGN PERMISSION TO DELETE TOUR ONLY ADMIN AND LEAD-GUIDE
exports.restricTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.roles)) {
            return next(new AppError("You do not have permission to delete tour"))
        }
        next();
    }
}

// FORGOT PASSWORD ROUTE
exports.forgotPassword = catchAsync(async (req, res, next) => {
    //check user of posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError("There is no user with this email", 404))
    }

    // generate resetToken
    const resetToken = await user.createPasswordRestToken();

    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const configration = {
        email: user?.email,
        subject: "Your password reset is valid for 10 mins",
        message: `Forgot your password! Submit a patch request with you new pasword and confirm password to : ${resetURL}.\n if you dont forgot then ignore this mail`
    }

    try {

        //send it to user email 
        await sendEmail(configration);

        return res.status(200).json({
            status: "success",
            message: "Token send to your email"
        })
    } catch {
        user.passwordRestToken = undefined;
        user.passwordRestExpires = undefined;
        await user.save({ validateBeforeSave: false });
        next(new AppError("There was a error in sending email. Please try again", 500))
    }




})


// RESETPASSWORD ROUTE
exports.resetPassword = catchAsync(async (req, res, next) => {

    // convert plain token to hash formate
    // const hasedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const hasedToken = crypto.createHash("sha256").update(req.params.token).digest("hex")

    // get user base  token
    const user = await User.findOne({
        passwordRestToken: hasedToken,
        passwordRestExpires: {
            $gt: Date.now()
        }
    })


    //if token is not expired and user are there so set new password
    if (!user) {
        return next(new AppError("Token is invalid or has expired", 400))
    }


    user.password = req?.body?.password;
    user.confirmPassword = req?.body?.confirmPassword;
    user.passwordRestToken = undefined;
    user.passwordRestExpires = undefined;
    await user.save();

    //update change passwordAt for user in model using pre methods

    //IF EVERYTHING OK SO SEND TOKEN TO CLIENT 
    createSendToken(user, 200, res)

    // const token = jwtTokenSing(user?._id);
    // res.status(200).json({
    //     status: "success",
    //     token,
    // })
})

//UPDATE PASSWORD ROUTE 
exports.updatePassword = catchAsync(async (req, res, next) => {

    //GET USER FROM COLLECTION
    // user in req object is added from protect middleware
    const user = await User.findById(req?.user?.id).select("+password");
    //OR
    // const user = await User.findOne({ email: req?.body?.email }).select("+password");

    if (!user) {
        return next(new AppError("User are not available with posted email", 400))
    }

    //CHECK IF POSTED CURRENT IS CORRECT
    const isMatched = await user.correctPassword(req.body.currentPassword, user.password);

    if (!isMatched) {
        return next(new AppError("Your current password is worng!", 401))
    }

    // SO UPDATE THE USER PASSWORD
    user.password = req?.body?.password;
    user.confirmPassword = req?.body?.confirmPassword;
    await user.save();

    //LOGIN USRE SEND JWT TOKEN
    createSendToken(user, 200, res)

    //     const token = jwtTokenSing(user?._id);
    //    return res.status(200).json({
    //         status: "success",
    //         token,
    //         user,
    //     })
})