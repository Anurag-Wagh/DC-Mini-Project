// server.js - Bridge between NS3 and web visualization
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Initialize express app
const app = express();
app.use(cors());

// Configure body-parser to handle both JSON and text
app.use(bodyParser.json({
  limit: '50mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      req.rawBody = buf.toString();
    }
  }
}));
app.use(bodyParser.text({ limit: '50mb', type: '*/*' }));
app.use(express.static(path.join(__dirname)));

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
let clients = [];

// Handle WebSocket connections
wss.on('connection', (ws) => {
    clients.push(ws);
    console.log('Client connected. Total clients:', clients.length);

    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
        console.log('Client disconnected. Total clients:', clients.length);
    });
});

// Broadcast message to all connected clients
function broadcast(message) {
    const data = typeof message === 'string' ? message : JSON.stringify(message);
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

// Route to handle updates from NS3
app.post('/update-data', (req, res) => {
    try {
        let data;

        if (typeof req.body === 'string') {
            try {
                // Try to parse the entire body as JSON first
                data = JSON.parse(req.body);
            } catch (parseError) {
                // If that fails, try to extract JSON from the string
                const jsonMatch = req.body.match(/\{.*\}/s);
                if (jsonMatch) {
                    try {
                        data = JSON.parse(jsonMatch[0]);
                    } catch (e) {
                        console.error('Error parsing extracted JSON:', e);
                        return res.status(200).send({ status: 'success' });
                    }
                } else {
                    return res.status(200).send({ status: 'success' });
                }
            }
        } else {
            data = req.body;
        }

        if (data) {
            console.log('Received data from NS3:', data);
            broadcast(data);
        }

        res.status(200).send({ status: 'success' });
    } catch (error) {
        console.error('Error processing update:', error);
        res.status(200).send({ status: 'success' });
    }
});

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
