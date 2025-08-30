import express from "express";
import{Server} from "socket.io";
import{createServer} from "http";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port= 3000;
const app= express();
const server = createServer(app);

// ✅ Serve frontend from client folder
app.use(express.static(path.join(__dirname, '../patient')));


const io = new Server(server, {
    cors: {
        origin: "*",  // or specify your frontend URL like "http://localhost:5173"
        methods: ["GET", "POST"],
        credentials: true,
    },
});

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
));

app.get("/", (req, res) => {
    res.send("Hello from socket.IO server");
});

io.on("connection", (socket)=> {
    console.log("User Connected");
    console.log("Id" , socket.id);
    socket.emit("welcome", `welcome to the server ${socket.id}`);
    socket.broadcast.emit("welcome", `${socket.id} join the server`);

    socket.on("chatMessage", (data) => {
        io.emit("chatMessage", data); // Broadcast to all clients
    });

    socket.on("typing", () => {
        socket.broadcast.emit("userTyping", "Someone");
    });

    socket.on("stopTyping", () => {
        socket.broadcast.emit("userStoppedTyping");
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected:", socket.id);
    });

});
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});