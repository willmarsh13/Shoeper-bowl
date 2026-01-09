const router = require("express").Router();

router.use("/Requests", require("./Requests"))
router.use("/ServiceAcct", require("./ServiceAcct"))
router.use("/Accounts", require("./Accounts"))
router.use("/Scoring", require("./Scoring"))

module.exports = router;