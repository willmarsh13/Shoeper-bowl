const router = require("express").Router();
const {updateScores, getScores} = require('./databaseOperations')

router
    .route("/")
    .get((req, res) => {
        getScores(req, res).then((data) => {
            res.status(200).json(data);
        })
    })

router
    .route("/")
    .post((req, res) => {
        updateScores(req, res).then((data) => {
            res.status(200).json(data);
        })
    })

module.exports = router;