const app = require("./app")

const port = 8000;
// start server here
app.listen(port, () => {
    console.log(`App running on port ${port} ...`)
})