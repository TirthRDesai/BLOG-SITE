import { createClient } from "@supabase/supabase-js";
import { createServer } from "http"
import { Server } from "socket.io"

const SUPABASE_URL = "https://tqjvanvhrtqivqsexeur.supabase.co"
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxanZhbnZocnRxaXZxc2V4ZXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDM3MTgxODYsImV4cCI6MjAxOTI5NDE4Nn0.93PC05Xpt_JAO7sziYSM7TW9MNl4Q5VLDsakACHgiwQ"

const supabase = createClient(SUPABASE_URL, ANON_KEY)


const server = createServer({
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const io = new Server(server);

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('message', (data) => {
        console.log('Received message:', data);
        io.emit('message', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const port = process.env.PORT || 3001;

server.listen(port, '0.0.0.0', () => {
    console.log(`WebSocket server running on port ${port}`);
});
