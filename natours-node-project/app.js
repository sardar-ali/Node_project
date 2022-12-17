const express = require("express");
const morgan = require("morgan");
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


module.exports = app;
