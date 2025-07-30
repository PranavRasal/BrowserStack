import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { LogWatcher } from "./LogWatcher.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;

const watcher = new LogWatcher("./log.txt");

app.use(express.static(path.join(process.cwd(), "public")));

io.on("connection", (socket) => {
    console.log("Client connected");
    socket.emit("logUpdate", watcher.getLastLines(10));

    const sendUpdate = (data) => {
        socket.emit("logUpdate", data);
    };

    watcher.on("update", sendUpdate);

    socket.on("disconnect", () => {
        watcher.off("update", sendUpdate);
        console.log("Client disconnected");
    });
});

server.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
