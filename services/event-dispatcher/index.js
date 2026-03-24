const express = require("express");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const port = process.env.PORT || 3000;
const { connectProducer, publishEvent } = require('./kafka');

connectProducer();

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.json({
        service: "event-dispatcher",
        status: "running"
    });
});

app.post("/webhooks/grafana", async (req, res) => {
    const { title, state, message, ruleUrl } = req.body;
    console.log(`[GRAFANA] Received alert: ${title || "Unknown"} | ${state || "Unknown"}`);
    if (message) console.log(`[GRAFANA] Message: ${message}`);
    
    await publishEvent('alerts-topic', {
        source: 'grafana',
        timestamp: new Date().toISOString(),
        payload: { title, state, message, ruleUrl }
    });

    io.emit('new-incident', {
        source: 'grafana',
        title,
        severity: state === 'alerting' ? 'CRITICAL' : 'WARNING'
    });

    res.status(200).json({ status: "received" });
});

app.post("/webhooks/github", async (req, res) => {
    const event = req.headers['x-github-event'] || "unknown";
    const action = req.body.action || "triggered";
    console.log(`[GITHUB] Received event: ${event} | Action: ${action}`);
    
    let repoName = "unknown";
    if (req.body.repository) {
        repoName = req.body.repository.full_name;
        console.log(`[GITHUB] Repo: ${repoName}`);
    }

    await publishEvent('alerts-topic', {
        source: 'github',
        timestamp: new Date().toISOString(),
        payload: { event, action, repository: repoName }
    });

    io.emit('new-incident', {
        source: 'github',
        title: `${event}: ${action}`,
        severity: 'MEDIUM'
    });

    res.status(200).json({ status: "received" });
});

io.on('connection', (socket) => {
    console.log('Dashboard connected to real-time stream', socket.id);
});

server.listen(port, () => {
    console.log(`Event Dispatcher running on port ${port}`);
});
