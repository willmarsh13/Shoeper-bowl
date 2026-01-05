const router = require("express").Router();
const authOps = require("./authorization.js")

router
    .route("/login")
    .post((req, res) => {
        authOps.SignUserIn(req, res).then((data) => {
            res.status(200).json(data);
        })
    })

router
    .route("/signUp")
    .post((req, res) => {
        authOps.signUp(req, res).then((data) => {
            res.status(200).json(data);
        })
    })

router
    .route("/check")
    .get((req, res) => {
        authOps.checkLogin(req, res).then((data) => {
            res.status(200).json(data);
        })
    })

router
    .route("/resetPwd")
    .post((req, res) => {
        authOps.updatePassword(req, res).then((data) => {
            res.status(200).json(data);
        })
    })

router
    .route("/forgot-password")
    .post((req, res) => {
        authOps.requestPasswordReset(req, res).then((data) => {
            res.status(200).json(data);
        })
    })

router
    .route("/reset-password")
    .post((req, res) => {
        authOps.resetPasswordWithToken(req, res).then((data) => {
            res.status(200).json(data);
        })
    })

router
    .route("/logout")
    .post((req, res) => {
        authOps.logout(req, res).then((data) => {
            res.status(200).json(data);
        })
    })

module.exports = router;