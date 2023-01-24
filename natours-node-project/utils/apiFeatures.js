

class APIFeatures {
    constructor(query, querString) {
        this.query = query;
        this.querString = querString;
    }

    filter() {
        // 1) filtering
        let queyObj = { ...this.querString };
        const excludedFields = ["page", "sort", "limit", "fields"]
        excludedFields.forEach((el) => delete queyObj[el]);

        // 2) advanced fitering
        let queryStr = JSON.stringify(queyObj)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }

    sort() {
        if (this.querString.sort) {
            const sortBy = this.querString.sort.replaceAll(",", " ");
            this.query = this.query.sort(sortBy)
        } else {
            this.query = this.query.sort({ price: '-1' });
        }

        return this;

    }

    limitsFields() {
        if (this.querString.fields) {
            const fields = this.querString.fields.replaceAll(",", " ");
            this.query = this.query.select(fields)
        } else {
            this.query = this.query.select("-__v")
        }
        return this;
    }

    
    pagination() {
        const page = this.querString.page * 1 || 1;
        const limit = this.querString.limit * 1 || 10;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit)

        return this;

    }
}

module.exports = APIFeatures;