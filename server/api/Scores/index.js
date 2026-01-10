const router = require("express").Router();
const {getScores} = require("./databaseOperations.js")

router
    .route("/")
    .get((req, res) => {
        getScores(req, res).then((data) => {
            res.status(200).json(data);
        })
    })


module.exports = router;