const router = require("express").Router();
const {getAccounts} = require('./databaseOperations')

router
    .route("/")
    .get((req, res) => {
        getAccounts(req, res).then((data) => {
            res.status(200).json(data);
        })
    })

module.exports = router;