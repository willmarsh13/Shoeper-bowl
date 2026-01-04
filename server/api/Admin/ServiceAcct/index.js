const router = require("express").Router();
const {CreateServiceAccount, DeleteServiceAccount, ResetServiceAccount, GetServiceAccounts} = require('./databaseOperations')

router
    .route("/create")
    .post((req, res) => {
        CreateServiceAccount(req, res).then((data) => {
            res.status(200).json(data);
        })
    })

router
    .route("/delete")
    .post((req, res) => {
        DeleteServiceAccount(req, res).then((data) => {
            res.status(200).json(data);
        })
    })

router
    .route("/reset")
    .post((req, res) => {
        ResetServiceAccount(req, res).then((data) => {
            res.status(200).json(data);
        })
    })

router
    .route("/")
    .get((req, res) => {
        GetServiceAccounts(req, res).then((data) => {
            res.status(200).json(data);
        })
    })

module.exports = router;