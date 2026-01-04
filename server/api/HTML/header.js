const {checkAdmin} = require("../Auth/authorization");

const router = require("express").Router();

let settings = []

router
    .route("/")
    .get(async (req, res) => {
        let userInfo = await checkAdmin(req, res)
        if (userInfo?.Role === "Admin") {
            settings = [
                {name: `${userInfo?.firstName} ${userInfo?.lastName}`, link: '/shoeper-bowl/profile'},
                {name: 'Admin', link: '/shoeper-bowl/Admin'},
                {name: 'Logout', link: '/shoeper-bowl/logout'}]
        } else {
            settings = [
                {name: `${userInfo?.firstName} ${userInfo?.lastName}`, link: '/shoeper-bowl/profile'},
                {name: 'Logout', link: '/shoeper-bowl/logout'}
            ]
        }

        res.status(200).json({
            settings: [...new Set(settings)] || [],
            accountInfo: {
                firstName: userInfo.firstName,
                lastName: userInfo.lastName,
                Role: userInfo.Role,
                Email: userInfo.Email
            },
        })
    })

module.exports = router;