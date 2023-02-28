const mongoose = require("mongoose");
const crypto = require("crypto");
const validator = require("validator");
const bcrypt = require("bcryptjs")

//schema definitions
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter your name"]
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        required: [true, "Please Enter your email"],
        lowercase: true,
        validate: [validator?.isEmail, "Please Enter a valid email"]
    },
    photo: String,
    roles: {
        type: String,
        enum: ["user", "guide", "lead-guide", "admin"],
        default: "user"
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minlength: [8, "Password must be 8 or more charactors"],
        maxlength: [20, "Password must be 20 or less charactors"],
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, "Please confirm your password"],
        minlength: [8, "Password must be 8 or more charactors"],
        maxlength: [20, "Password must be 20 or less charactors"],
        validate: {
            validator: function (el) {
                // this validation are only work on the create and save method 
                return el === this.password
            },
            message: "Password are not match!"
        }
    },
    passwordChangedAt: Date,
    passwordRestToken: String,
    passwordRestExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    }
});

//gry only those user whoes active is true
userSchema.pre(/^find/, function (next) {
    //this point to current query
    this.find({ active: { $ne: false } });
    next()
})


//use this hooks to encryp password before saving to database
userSchema.pre("save", async function (next) {

    // check if the password are modify then run the function 
    if (!this.isModified("password")) return next();

    //here hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    //delete the confirmpassword here
    this.confirmPassword = undefined;
    next();
});


// set the passwordChangeAt here 
userSchema.pre("save", function (next) {

    if (!this.isModified("password") || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    return next()
})


//this is mongoose schmea instence method that are available in all user documents
userSchema.methods.correctPassword = async function (condidatePassword, userPassword) {
    return await bcrypt.compare(condidatePassword, userPassword)
}


//check if the password change after jwt token issue so protect our rout in that case
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        //convert date to milisecond times
        const changeTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)

        //check toke issue date is less then password change date 
        return JWTTimestamp < changeTimestamp;
    }

    //FALSE mean password is not change
    return false;
}


//create and set refresh token for password reset or forgot
userSchema.methods.createPasswordRestToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordRestToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordRestExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

const User = mongoose.model("User", userSchema);

module.exports = User;