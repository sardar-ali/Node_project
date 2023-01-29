const AppError = require("../utils/appError")

// ERROR OF INVALID DB FIELD
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err?.path} : ${err?.value}`
    return new AppError(message, 400)
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
        // console.error("ERROR ::", err)

        // SEND GENERIC ERROR TO CLIENT 
        res.status(500).send({
            status: "error",
            message: "Something went worng!"
        })
    }
}


module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
        developmentError(err, res)
    } else if (process.env.NODE_ENV.trim() === "production") {
        let error = { ...err };

        if (error?.name === "CastError") error = handleCastErrorDB(error)
        productionError(error, res);
    }


}