import 'dotenv/config.js'
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { createMergeableStore } from 'tinybase';
import { createWsServer } from 'tinybase/synchronizers/synchronizer-ws-server';
import { createWsSynchronizer } from 'tinybase/synchronizers/synchronizer-ws-client';


// Create TinyBase store
const store = createMergeableStore();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Initialize TinyBase WebSocket server
const wsServer = createWsServer(wss);

// Handle WebSocket connections
wss.on('connection', async (ws) => {
    console.log('New client connected');

    // Create synchronizer for each client
    const synchronizer = await createWsSynchronizer(store, ws);
    await synchronizer.startSync();

    ws.on('close', () => {
        console.log('Client disconnected');
        synchronizer.destroy();
    });
});


// add route to create rooms  and users will join thse rooms  

// Basic route
app.get('/', (req, res) => {
    res.send('🧠 TinyBase WebSocket Server running!');
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
