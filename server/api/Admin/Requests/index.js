const router = require("express").Router();
const {getRequests, updateRequest} = require('./databaseOperations')

router
    .route("/")
    .get((req, res) => {
        getRequests(req, res).then((data) => {
            res.status(200).json(data);
        })
    })

router
    .route("/update")
    .post((req, res) => {
        updateRequest(req, res).then((data) => {
            res.status(200).json(data);
        })
    })

module.exports = router;