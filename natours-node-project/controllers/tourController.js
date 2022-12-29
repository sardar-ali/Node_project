// const fs = require("fs");
const { json } = require("express")
const Tour = require("./../models/tourModel")

//read file and convert json data to javascript object 
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))


// exports.checkID = (req, res, next, val) => {

//     console.log(`TOUR ID IS :: ${val}`)
//     if (req.params.id > tours.length - 1) {
//         return res.status(404).send({
//             status: "fail",
//             message: "Invalid ID"
//         })
//     }

//     next();
// }


exports.aliasTopTours = (req, res, next) => {
    req.query.limit = "5";
    req.query.sort = "-ratingsAverage,price";
    req.query.fields = "name, ratingsAverage, price, difficulty, summary";
    next()
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
exports.getAllTours = async (req, res) => {
    try {

        //BUILD QUERY
        // 1) filtering
        let queyObj = { ...req.query };
        const excludedFields = ["page", "sort", "limit", "fields"]
        excludedFields.forEach((el) => delete queyObj[el]);

        // 2) advanced fitering
        let queryStr = JSON.stringify(queyObj)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
        let query = Tour.find(JSON.parse(queryStr));

        // 3) SORTING
        if (req.query.sort) {
            const sortBy = req.query.sort.replaceAll(",", " ");
            query = query.sort(sortBy)
        } else {
            query = query.sort({ price: '-1' });
        }

        // 4) RESPONSE LIMIT 
        if (req.query.fields) {
            const fields = req.query.fields.replaceAll(",", " ");
            query = query.select(fields)
        } else {
            query = query.select("-__v")
        }




        // 5) PAGINATION
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 10;
        const skip = (page - 1) * limit;

        query = query.skip(skip).limit(limit)

        if (req.query.page) {
            const numTours = await Tour.countDocuments();
            if (skip >= numTours) {
                throw new Error("This page is not exist!")
            }
        }

        // EXECUTE QUERY
        const tours = await query;

        // SEND RESPONSE
        res.status(200).send({
            status: "success",
            results: tours.length,
            data: {
                tours
            }
        })
    } catch (err) {
        res.status(404).send({
            status: "fail",
            message: {
                err
            }
        })
    }

    // res.status(200).json({
    //     status: "success",
    //     createdAt: req.requestTime,
    // results: tours.length,
    // data: {
    //     tours
    // }
    // })

}


//get single tour on the bases of id
exports.getTour = async (req, res) => {

    const id = req.params.id;


    try {
        let tours = await Tour.findById(id);
        res.status(200).send({
            status: "success",
            data: {
                tours
            }
        })
    } catch (err) {
        res.status(404).send({
            status: "fail",
            message: {
                err
            }
        })
    }

    // const tour = tours.find((item) => item.id === id);
    // if (!tour) {
    //     return res.status(404).json({
    //         status: "Fail",
    //         message: "Invalid Id"
    //     })
    // }
    // res.status(200).send({
    //     status: "success",
    //     data: {
    //         tour,
    //     }
    // })

}

// create a post request to add a new post in tours array
exports.createTours = async (req, res) => {

    // const newId = tours[tours.length - 1].id + 1;
    // const newTour = Object.assign({ id: newId }, req.body);
    // tours.push(newTour);
    // fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    //     res.status(201).json({
    //         status: "success",
    //         data: { tours: req.body }
    //     })
    // });

    try {
        const newTour = await Tour.create(req.body);
        res.status(201).send({
            status: "success",
            createdAt: req.requestTime,
            data: { tours: newTour }
        })
    } catch (error) {
        res.status(400).send({
            status: "fail",
            message: "Invalid Data",
        })
    }
}


//update tour
exports.updateTour = async (req, res) => {
    try {

        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })

        return res.status(200).send({
            status: "success",
            data: {
                tour
            }
        })
    } catch (error) {
        res.status(404).send({
            status: "fail",
            message: error
        })
    }

}

//delete tour
exports.deleteTour = async (req, res) => {
    try {
        let tour = await Tour.findByIdAndDelete(req.params.id)
        res.status(204).send({
            status: "success",
            data: {
                tour
            },
            message: "Tour Deleted Successfully",
        })
    } catch (error) {
        res.status(404).send({
            status: "Faild",
            message: {
                error
            }
        })
    }


}

