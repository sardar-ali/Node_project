const AppError = require("../utils/appError")

// ERROR OF INVALID DB FIELD
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err?.path} : ${err?.value}`
    return new AppError(message, 400)
}

// ERROR OF DUPLICATE VALUE OF DB FIELD
const handleDuplicateErrorDB = (err) => {
    const value = err?.keyValue?.name;
    const message = `Duplicate field value : ${value}. Please use another value!`
    return new AppError(message, 400)
}

const handleValidationErrorDB = (err) => {
   
    const list = [];
    const errObj = err?.errors
    
    for (let key in errObj) {
        list.push( errObj[key]?.message +  ". ")
    }
    const values = `Invalid field value :${list}`;
return new AppError(values, 400)
}

//ERROR FOR DEVELOPMENT ENVIRONEMENT 
const developmentError = (err, res) => {
    res.status(err?.statusCode).send({
        status: err.status,
        error: err,
        message: err.message,
        stack: err?.stack
    })
}


// ERROR FOR PRODUCTION ENIRONEMENT
const productionError = (err, res) => {
    //OPERATIONAL ERROR TRUEST SEND TO CLIENT
    if (err?.isOperational) {
        res.status(err?.statusCode).send({
            status: err.status,
            message: err.message
        })
        // PROGRAMING OR OTHER UNKNOWN ERROR: DON'T LEAK ERROR DETAILS TO CLIENT  
    } else {
        // LOG ERROR 
        console.error("ERROR ::", err)

        // SEND GENERIC ERROR TO CLIENT 
        res.status(500).send({
            status: "error",
            message: "Something went worng!"
        })
    }
}

//HANDLE INVALID JWT TOKNE ERROR
const handleJwtError = (err, res) => new AppError("Invalid token. Please login again!", 401);

//HANDLE EXPIRE TOKE ERROR HERE
const handleJwtExpireError = (err, res) => new AppError("Your token has expired. Please login again!", 401);

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    // console.log("error ::", err?.name)
    if (process.env.NODE_ENV === "development") {
        developmentError(err, res)
    } else if (process.env.NODE_ENV.trim() === "production") {
        let error = { ...err };
        console.log("error ::", error)
        if (error?.name === "CastError") error = handleCastErrorDB(error);
        if (error?.code === 11000) error = handleDuplicateErrorDB(error);
        if (err?.name === "ValidationError") error = handleValidationErrorDB(error);
        if (error?.name === "JsonWebTokenError") error = handleJwtError(error);
        if (error?.name === "TokenExpiredError") error = handleJwtExpireError(error);
        
        productionError(error, res);
    }


}