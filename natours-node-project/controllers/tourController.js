const fs = require("fs");


//read file and convert json data to javascript object 
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))


exports.checkID = (req, res, next, val) => {

    console.log(`TOUR ID IS :: ${val}`)
    if (req.params.id > tours.length - 1) {
        return res.status(404).send({
            status: "fail",
            message: "Invalid ID"
        })
    }

    next();
}


exports.checkBody = (req, res, next) => {
    if (!req.body["name"] || !req.body["price"]) {
        console.log("error occured in create post")
        return res.status(404).send({
            status: "fail",
            message: "Invalid Data!"
        })
    } else {
        console.log("created successfully!")
    }
    next();
}



// hite the that send tours in response to user
exports.getAllTours = (req, res) => {

    res.status(200).json({
        status: "success",
        created_at: req.requestTime,
        results: tours.length,
        data: {
            tours
        }
    })

}


//get single tour on the bases of id
exports.getTour = (req, res) => {

    const id = req.params.id * 1;
    const tour = tours.find((item) => item.id === id);

    res.status(200).send({
        status: "success",
        data: {
            tour,
        }
    })

}

// create a post request to add a new post in tours array
exports.createTours = (req, res) => {

    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id: newId }, req.body);
    tours.push(newTour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        res.status(201).json({
            status: "success",
            data: { tours: req.body }
        })
    });

}


//update tour
exports.updateTour = (req, res) => {

    res.status(201).send({
        status: "sucess",
        data: {
            tours: "update sucessfully"
        }
    })

}

//delete tour
exports.deleteTour = (req, res) => {

    res.status(204).send({
        status: "success",
        message: "deleted successfully",
        data: null,
    })

}

