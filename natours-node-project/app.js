const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require('express-rate-limit')
const mongoSanitize = require("express-mongo-sanitize")
const xss = require("xss-clean")
const AppError = require("./utils/appError")
const globalErrorHanlder = require("./controllers/errorController")
const tourRouter = require("./routes/tourRoutes")
const userRouter = require("./routes/userRoutes")

const app = express();

//GLOBLE MIDDLEWARE
//HELMET SET SECURITY OF OUR HTTP HEADER
app.use(helmet())

//RATE LIMIT MIDDLEWARE HANDLE ONLY 100 REQUEST FROM SOME IP IN HOURS
const limiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 60 minutes)
    message:"Too many requrest from this IP, please try again in hour!",
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use("/api", limiter)

// BODY PARSER MIDDLEWARE, READING DATA FROM THE BODY (req.body)
app.use(express.json({limit:"10kb"}));


//DATA SANITIZATION AGAINST NOSQL QUERY INJECTION
app.use(mongoSanitize());

//DATA SANITIZATION AGAIN XSS

app.use(xss())
//DEVELOPMENT LOGGING
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"))
}


//static file serve here
app.use(express.static(`${__dirname}/public`))

//test middleware for created_at
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next()
})


//app routes
app.use("/api/v1/tours", tourRouter)
app.use("/api/v1/users", userRouter)

//Not found route
app.all("*", (req, res, next) => {
    // res.status(404).send({
    //     status: "fail",
    //     message: `Can't find ${req.originalUrl} on this server`
    // })

    // const err = new Error(`Can't find ${req.originalUrl} on this server`);
    // err.status = "fail";
    // err.statusCode = 404;

    // next(err)

    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
})

// GLOBLE ERROR HANDLING MIDDLEWARE 
app.use(globalErrorHanlder)

module.exports = app;
