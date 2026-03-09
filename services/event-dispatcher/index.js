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

app.listen(port, () => {
    console.log(`Event Dispatcher running on port ${port}`);
});
