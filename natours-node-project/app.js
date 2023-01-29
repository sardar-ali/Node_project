const express = require("express");
const morgan = require("morgan");
const AppError = require("./utils/appError")
const globalErrorHanlder = require("./controllers/errorController")
const tourRouter = require("./routes/tourRoutes")
const userRouter = require("./routes/userRoutes")

const app = express();

//middlewares
app.use(express.json())
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"))
}


//static file serve here
app.use(express.static(`${__dirname}/public`))

//middleware for created_at
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
