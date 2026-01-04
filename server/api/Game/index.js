const router = require("express").Router();
const {getGameInfo} = require("./databaseOperations.js")

router
    .route("/info")
    .get((req, res) => {
        getGameInfo(req, res).then((data) => {
            res.status(200).json(data);
        })
    })

module.exports = router;