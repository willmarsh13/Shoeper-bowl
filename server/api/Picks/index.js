const router = require("express").Router();
const {postPicks, getPicks} = require("./databaseOperations.js")

router
    .route("/")
    .post((req, res) => {
        postPicks(req, res).then((data) => {
            res.status(200).json(data);
        })
    })

router
    .route("/")
    .get((req, res) => {
        getPicks(req, res).then((data) => {
            res.status(200).json(data);
        })
    })

module.exports = router;