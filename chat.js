import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";

const app = express();
const __dirname = path.resolve();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, "public")));

const io = new Server(server);

io.on("connection", (socket) => {

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "chat.html"));
});

server.listen(9000, () => {
    console.log("server listen at 9000");
});
