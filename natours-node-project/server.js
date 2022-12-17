const dotenv = require("dotenv")
const mongoose = require("mongoose")
dotenv.config({ path: "./config.env" })
const app = require("./app");

//get database url from .env file
const DB = process.env.DATABASE

//mongodb connections
mongoose.connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((cont) => {
        console.log('DB connections successfull!')
        // console.log('connection ::', cont.connections)
    }).catch((err) => console.log(err))



const port = process.env.PORT || 5000;

// start server here
app.listen(port, () => {
    console.log(`App running on port ${port} ...`)
})