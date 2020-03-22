const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
    morgan("short", {
        skip: process.env.NODE_ENV === "production"
    })
);

/*
address: {
	unit: "apt 122",
	number: "123",
	street: "wentz st",
	city: "Springfield",
	state: "illinois",
	postalCode: "65521"
}

person: {
	name: "joe bill",
	phone: "+14133333333"
}

*/

app.get("/", async function (req, res) {
    res.json({ message: "hooray! welcome to our api!" });
});

// app.get("/team", async function(req, res) {});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
    return res.status(err.statusCode || 500).json({
        message: err.message || "Something went wrong"
    });
});

module.exports = app;
