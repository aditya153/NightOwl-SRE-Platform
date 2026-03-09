const express = require("express");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.json({
        service: "event-dispatcher",
        status: "running"
    });
});

app.post("/webhooks/grafana", (req, res) => {
    const { title, state, message, ruleUrl } = req.body;
    console.log(`[GRAFANA] Received alert: ${title || "Unknown"} | ${state || "Unknown"}`);
    if (message) console.log(`[GRAFANA] Message: ${message}`);

    res.status(200).json({ status: "received" });
});

app.listen(port, () => {
    console.log(`Event Dispatcher running on port ${port}`);
});
