import 'dotenv/config.js'
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { createMergeableStore } from 'tinybase';
import { createWsServer } from 'tinybase/synchronizers/synchronizer-ws-server';
import { createWsSynchronizer } from 'tinybase/synchronizers/synchronizer-ws-client';
import cors from 'cors';

// Create TinyBase store
const store = createMergeableStore();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server with proper options
const wss = new WebSocketServer({
    server,
    path: '/ws', // Add specific path for WebSocket
    clientTracking: true,
    perMessageDeflate: false
});

// Initialize TinyBase WebSocket server
const wsServer = createWsServer(wss);

// Handle WebSocket connections
wss.on('connection', async (ws, req) => {
    console.log('New client connected from:', req.socket.remoteAddress);

    try {
        // Create synchronizer for each client
        const synchronizer = await createWsSynchronizer(store, ws);
        await synchronizer.startSync();

        ws.on('close', () => {
            console.log('Client disconnected');
            synchronizer.destroy();
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    } catch (error) {
        console.error('Error setting up synchronizer:', error);
    }
});

// Basic route
app.get('/', (req, res) => {
    res.send('🧠 TinyBase WebSocket Server running!');
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
}); 