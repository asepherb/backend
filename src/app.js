const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const OnFleet = require("@onfleet/node-onfleet");

const neighborhoodService = require("./services/neighborhood");
const task = require("./helpers/onfleet/task");
const firebaseService = require("./services/firebase");
const sendgridService = require("./services/sendgrid");

const app = express();
const onfleet = new OnFleet(process.env.ONFLEET_KEY);

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

app.get("/task/:id", async function (req, res) {
    const result = await task.getTask(req.param.id);
    res.json(result);
});

app.post("/task", async function (req, res, next) {
    const address = req.body.address;
    try {
        const neighborhoodName = await neighborhoodService.getNeighborhood({
            streetAddress: address.number + " " + address.street,
            unit: address.apartment,
            city: address.city,
            state: address.state,
            zipcode: address.postalCode
        });
        console.log(neighborhoodName);
        const results = await task.createTask(
            req.body.address,
            req.body.person,
            req.body.notes
        );
        res.json(results);
    } catch (error) {
        next(error);
    }
});

app.patch("/task/:id", async function (req, res) {
    const results = await task.updateTask(req.params.id, req.query.body);
    res.json(results);
});

app.delete("/task/:id", async function (req, res) {
    const results = task.deleteTask(req.param.id);
    res.json(results);
});

app.post("/team", async function (req, res) {
    const address = req.body.address;
    const neighborhoodData = await neighborhoodService.getNeighborhood({
        streetAddress: address.number + " " + address.street,
        unit: address.apartment,
        city: address.city,
        state: address.state,
        zipcode: address.postalCode
    });
    console.log(neighborhoodData);
    const name = neighborhoodData.short_name.replace("/", "-");
    const neighborhoodID = neighborhoodData.id;
    onfleet.teams
        .create({
            name: neighborhoodID
        })
        .catch(function () {
            res.status(409).send("Team already exists");
        })
        .then(function (response) {
            const id = response.id;
            firebaseService.writeNewTeam(name, id, neighborhoodID);
            res.status(200).json({
                onFleetID: id,
                name: name,
                neighborhoodID: neighborhoodID
            });
        });
});

app.post("/email", async function (req, res) {
    console.log(req.body.email);
    const result = await sendgridService.addEmailToList(req.body.email);
    res.status(result.statusCode).send();
});

// app.get("/team", async function(req, res) {});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
    return res.status(err.statusCode || 500).json({
        message: err.message || "Something went wrong"
    });
});

module.exports = app;
