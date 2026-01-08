const express = require('express');
const app = express();
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const {checkLogin, checkAdmin} = require('./api/Auth/authorization');
const port = 3002;

app.timeout = 60000;

// dependencies
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'https://willmarsh.dev',
    ], // Add your allowed origins here
    credentials: true,
}));

app.set("trust proxy", true);
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 500000}));

app.use(
    "/shoeper-bowl",
    express.static(path.resolve(__dirname, "../client/build"))
);

/**
 * Unprotected PATHs
 */
app.get("/shoeper-bowl/login", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});
app.get("/shoeper-bowl/signup", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});
app.get("/shoeper-bowl/forgot-password", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});
app.get("/shoeper-bowl/reset-password", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

app.use('/shoeper-bowl/api/HTML', require('./api/HTML'));

app.use('/shoeper-bowl/api/auth', require('./api/Auth'));

/**
 * Admin protected path
 */
app.use('/shoeper-bowl/api/Admin', async (req, res, next) => {
    try {
        let userInfo = await checkAdmin(req, res)
        if (userInfo?.Role === "Admin") {
            next()
        } else {
            res.status(401).json({
                message: "Unauthorized",
                status: 401,
                results: [],
            })
        }
    } catch (error) {
        next(error);
    }
}, require('./api/Admin'));

/**
 * All others (protected for login)
 */
app.use('/shoeper-bowl/api', async (req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    try {
        const data = await checkLogin(req);
        if (data?.status === 200) {
            next();
        } else {
            res.status(401).json({
                message: data?.message || "Unauthorized login attempt",
                status: data?.status || 401,
                results: []
            })
        }
    } catch (error) {
        next(error);
    }
}, require('./api'));

// app.get("/shoeper-bowl/assets", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
// });

app.get(/.*/, async (req, res, next) => {
    try {
        const data = await checkLogin(req);
        if (data?.status === 200) {
            res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
        } else {
            return res.redirect(`/shoeper-bowl/login`);
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
