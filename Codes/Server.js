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
    try {
        const data = typeof message === 'string' ? message : JSON.stringify(message);
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    } catch (error) {
        console.error('Error broadcasting message:', error);
    }
}

// Route to handle updates from NS3
app.post('/update-data', (req, res) => {
    try {
        let data;

        // Handle string input
        if (typeof req.body === 'string') {
            try {
                data = JSON.parse(req.body);
            } catch (parseError) {
                console.error('Error parsing JSON string:', parseError);
                return res.status(400).json({ error: 'Invalid JSON format' });
            }
        } else {
            data = req.body;
        }

        // Validate data structure
        if (!data || !data.type) {
            return res.status(400).json({ error: 'Invalid data format' });
        }

        // Log received data for debugging
        console.log('Received event type:', data.type);

        // Broadcast to all clients
        broadcast(data);

        res.status(200).json({ status: 'success' });
    } catch (error) {
        console.error('Error processing update:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
