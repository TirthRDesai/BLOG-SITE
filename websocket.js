const WebSocket = require("ws")
let clients = [];
function CreateWebSocketServer() {
    const wss = new WebSocket.Server({
        port: 8080
    });
    wss.on('connection', (ws) => {
        clients.push(ws);

        console.log('Client connected');

        ws.onopen = (e) => {
            console.log("Connection Opened")
        }

        ws.on('error', (err) => {
            console.warn(`Client disconnected - reason: ${err}`);
        });
        ws.on('message', (message) => {
            console.log('Received:', message.toString('utf-8'));
        });
        ws.on('close', () => {
            clients = clients.filter((client) => client !== ws);
        });
    });

    console.log('WebSocket server started on port 8080');
}

module.exports = {
    CreateWebSocketServer,
    clients
}
