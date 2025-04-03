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
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      // If JSON parsing fails, store the raw buffer for later processing
      req.rawBody = buf.toString();
    }
  }
}));
app.use(bodyParser.text());
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
        // Parse the incoming data
        let data;
        
        // If we have raw body (from failed JSON parsing)
        if (req.rawBody) {
            // Try to extract JSON from the string
            const jsonMatch = req.rawBody.match(/\{.*\}/s);
            if (jsonMatch) {
                try {
                    data = JSON.parse(jsonMatch[0]);
                } catch (e) {
                    console.error('Error parsing extracted JSON:', e);
                    return res.status(400).send({ status: 'error', message: 'Invalid JSON format' });
                }
            } else {
                return res.status(400).send({ status: 'error', message: 'No valid JSON found in request' });
            }
        } 
        // If we have a string body
        else if (typeof req.body === 'string') {
            try {
                data = JSON.parse(req.body);
            } catch (parseError) {
                console.error('Error parsing JSON string:', parseError);
                // Try to extract JSON from the string
                const jsonMatch = req.body.match(/\{.*\}/s);
                if (jsonMatch) {
                    try {
                        data = JSON.parse(jsonMatch[0]);
                    } catch (e) {
                        return res.status(400).send({ status: 'error', message: 'Invalid JSON format' });
                    }
                } else {
                    return res.status(400).send({ status: 'error', message: 'No valid JSON found in request' });
                }
            }
        } 
        // If we have a parsed JSON object
        else {
            data = req.body;
        }
        
        console.log('Received data from NS3:', data);
        
        // Broadcast to all connected clients
        broadcast(data);
        
        res.status(200).send({ status: 'success' });
    } catch (error) {
        console.error('Error processing update:', error);
        res.status(500).send({ status: 'error', message: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
