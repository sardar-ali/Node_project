const mongoose = require("mongoose");
const slugify = require("slugify")
const validator = require("validator")

//tour schema define
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A tour must have a name"],
        unique: true,
        trim: true,
        maxlength:[40, "A tour must have less or equal then 40 charactors"],
        minlength:[10, "A tour must have more or equal then 10 charactors"],
        // validate: [validator.isAlpha, "A tour name must contain only charactors"]
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, "A tour must have a duration"]
    },
    maxGroupSize: {
        type: Number,
        required: [true, "A tour must have a group size"]
    },
    difficulty: {
        type: String,
        required: [true, "A tour must have a difficulty"],
        enum:{
            values: ["easy", "medium", "difficult"],
            message: "Difficulty is either: easy, medium, difficult"
        }

    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, "A tour must have greater or equal to 1"],
        max: [5, "A tour must have less  or equal to 5.0"],
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, "A tour must have a price"]
    },
    priceDiscount: {
        type:Number,
        validate: { 
            validator: function (discount_price) { 
                // this points only to the current doc on New decoment creations
                return discount_price < this.price;
            },
            message : "Discount price ({VALUE}) should be below regular price"
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, "A tour must have a summary"]
    },
    description: {
        type: String,
        trim: true
    },

    imageCover: {
        type: String,
        required: [true, "A tour must have a cover image"]
    },
    images: [String],
    created_at: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: { 
        type: Boolean,
        default: false
    },
},

{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})

tourSchema.virtual("durationWeeks").get(function(){
   return this.duration / 7;
})

// RUN THE MADDILEWARE BEFORE SAVE AND CREATE METHOD EXPECT (insertMany)
tourSchema.pre("save", function(next){
     this.slug = slugify(this.name, {lower: true})
    next()
})


// tourSchema.pre("save", function(next) { 
//     console.log("Document will save ...");
//     next()
// });


// tourSchema.post("save", function(doc, next){
//     console.log("Doc :::", doc);
//     next()
// })


// tourSchema.pre("find", function(next){
tourSchema.pre(/^find/, function(next){
this.find({secretTour: {$ne: true}})
this.start = Date.now()
next();
})


// tourSchema.post(/^find/, function(doc,next){
// console.log(`this is quary took ${Date.now() - this?.start}`)
//     next();
// })

//USE AGGREGATE MIDDLEWARE TO EXCLUDE THOSE TOUR WHERE  secretTour === true
tourSchema.pre("aggregate", function(next) { 
    this.pipeline().unshift({$match: {secretTour : {$ne: true}}});
    next();
})




// tour model declearation
const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;