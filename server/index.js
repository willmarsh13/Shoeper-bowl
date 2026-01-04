const express = require('express');
const app = express();
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const {checkLogin, checkAdmin} = require('./api/Auth/authorization');
const port = 3002;

app.use(express.static(path.resolve(__dirname, "../client/build")));
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

/**
 * Unprotected PATHs
 */
app.get("/shoeper-bowl/login", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});
app.get("/shoeper-bowl/signup", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});
app.get("/shoeper-bowl/forgotPW", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

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

app.get("/shoeper-bowl/assets", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

app.get("/shoeper-bowl", async (req, res, next) => {
    try {
        const data = await checkLogin(req, res);
        if (data?.status === 200) {
            res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
        } else {
            return res.redirect(`http://${req.headers.host}/login`);
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
