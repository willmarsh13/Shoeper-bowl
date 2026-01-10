const router = require("express").Router();

router.use((req, res, next) => {
    console.log(`${req.url}`)
    next();
})

router.use("/Admin", require("./Admin"))
router.use('/Auth', require('./Auth'))
router.use('/HTML', require('./HTML'))

router.use('/playerSearch', require('./PlayerSearch'))
router.use('/game', require('./Game'))
router.use('/picks', require('./Picks'))
router.use('/overview', require('./Overview'))
router.use('/scores', require('./Scores'))

module.exports = router;