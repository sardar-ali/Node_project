const dotenv = require("dotenv")
const fs = require("fs")
const Tour = require("../../models/tourModel")
const mongoose = require("mongoose")
dotenv.config({ path: "./config.env" })

//get database url from .env file
const DB = process.env.DATABASE

//mongodb connections
mongoose.connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((cont) => {
        console.log('DB connections successfull!')
        // console.log('connection ::', cont.connections)
    }).catch((err) => console.log(err))


const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`))
const deleteAllToursData = async () => {
    try {
        await Tour.deleteMany();
        console.log("data deleted successfully");
    } catch (error) {
        console.log("Error ::", error)
    }
    process.exit()

}

const importData = async () => {
    try {
        await Tour.create(tours);
        console.log("data loaded successfully");
    } catch (error) {
        console.log("Error ::", error)
    }
    process.exit()
}


if (process.argv[2] === "--import") {
    importData()
} else if (process.argv[2] === "delete") {
    deleteAllToursData()
}

console.log(process.argv)