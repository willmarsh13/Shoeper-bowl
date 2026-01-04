const router = require("express").Router();

router.use("/Requests", require("./Requests"))
router.use("/ServiceAcct", require("./ServiceAcct"))

module.exports = router;