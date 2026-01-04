const router = require("express").Router();
const playerSearch = require("./databaseOperations.js")

router
    .route("/")
    .get((req, res) => {
        playerSearch(req, res).then((data) => {
            res.status(200).json(data);
        })
    })

module.exports = router;