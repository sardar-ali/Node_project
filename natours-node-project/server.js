const dotenv = require("dotenv")
const mongoose = require("mongoose")
dotenv.config({ path: "./config.env" })
const app = require("./app");

//handle uncaugh exception
process.on("uncaughtException", (err)=>{
    console.log("UNCAUGHT EXCEPTION"),
    console.log(err.name, err.message);
})

//get database url from .env file
const DB = process.env.DATABASE

//mongodb connections
mongoose.connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((cont) => {
        console.log('DB connections successfull!')
        // console.log('connection ::', cont.connections)
    })


const port = process.env.PORT || 5000;

// start server here
const server = app.listen(port, () => {
    console.log(`App running on port ${port} ...`)
})

//handle unhandledRejection
process.on("unhandledRejection", (err) => {
    console.log("UNHANDLER REJECTION"),
    console.log(err?.name, err?.message);
    server.close(() => {
        process.exit(1);
    })
})
