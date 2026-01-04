const {checkAdmin} = require("../Auth/authorization");

const router = require("express").Router();

let settings = []

router
    .route("/")
    .get(async (req, res) => {
        let userInfo = await checkAdmin(req, res)
        if (userInfo?.Role === "Admin") {
            settings = [
                {name: `${userInfo?.firstName} ${userInfo?.lastName}`, link: '/profile'},
                {name: 'Admin', link: '/Admin'},
                {name: 'Logout', link: '/logout'}]
        } else {
            settings = [
                {name: `${userInfo?.firstName} ${userInfo?.lastName}`, link: '/profile'},
                {name: 'Logout', link: '/logout'}
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