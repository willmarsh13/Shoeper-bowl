const router = require("express").Router();
const {getOverview} = require("./databaseOperations.js")

router
    .route("/")
    .get((req, res) => {
        getOverview(req, res).then((data) => {
            res.status(200).json(data);
        })
    })

module.exports = router;