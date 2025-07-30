const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");
const express = require("express");

class LogTailServer {
    constructor(port = 3000) {
        this.port = port;
        this.logFile = path.join(__dirname, "log.txt");
        this.clients = new Set();
        this.lastSize = 0;

        this.app = express();
        this.server = http.createServer(this.app);
        this.wss = new WebSocket.Server({ server: this.server });

        this.setupRoutes();
        this.setupWebSocket();
        this.startWatching();
    }

    setupRoutes() {
        this.app.use(express.static("public"));
        this.app.get(["/", "/log"], (req, res) =>
            res.sendFile(path.join(__dirname, "public", "log.html"))
        );
    }

    setupWebSocket() {
        this.wss.on("connection", (ws) => {
            this.clients.add(ws);
            ws.on("close", () => this.clients.delete(ws));

            try {
                this.sendToClient(ws, {
                    type: "init",
                    data: this.getLastNLines(10),
                });
            } catch (error) {
                this.sendToClient(ws, {
                    type: "error",
                    data: "Failed to load initial log content",
                });
            }
        });
    }

    getLastNLines(n = 10) {
        try {
            const fileSize = fs.statSync(this.logFile).size;
            if (fileSize === 0) return [];

            const chunkSize = Math.min(8192, fileSize);
            let buffer = Buffer.alloc(chunkSize);
            let lines = [];
            let position = fileSize;
            let remainingData = "";

            while (lines.length < n && position > 0) {
                const readSize = Math.min(chunkSize, position);
                position -= readSize;

                const fd = fs.openSync(this.logFile, "r");
                fs.readSync(fd, buffer, 0, readSize, position);
                fs.closeSync(fd);

                const chunk = buffer.slice(0, readSize).toString("utf8");
                const data = chunk + remainingData;
                const chunkLines = data.split("\n");
                remainingData = chunkLines.shift() || "";

                for (let i = chunkLines.length - 1; i >= 0; i--) {
                    if (chunkLines[i].trim() !== "") {
                        lines.unshift(chunkLines[i]);
                        if (lines.length >= n) break;
                    }
                }
            }

            if (lines.length < n && remainingData.trim() !== "")
                lines.unshift(remainingData);
            return lines.slice(-n);
        } catch (error) {
            return [];
        }
    }

    startWatching() {
        this.lastSize = this.getFileSize();
        fs.watch(this.logFile, () => this.handleFileChange());
        fs.watchFile(this.logFile, { interval: 500 }, (curr, prev) => {
            if (curr.mtime > prev.mtime) this.handleFileChange();
        });
    }

    getFileSize() {
        try {
            return fs.statSync(this.logFile).size;
        } catch {
            return 0;
        }
    }

    handleFileChange() {
        try {
            const currentSize = this.getFileSize();
            if (currentSize > this.lastSize) {
                const buffer = Buffer.alloc(currentSize - this.lastSize);
                const fd = fs.openSync(this.logFile, "r");
                fs.readSync(fd, buffer, 0, buffer.length, this.lastSize);
                fs.closeSync(fd);

                buffer
                    .toString("utf8")
                    .split("\n")
                    .forEach((line) => {
                        if (line.trim() !== "")
                            this.broadcast({ type: "update", data: line });
                    });

                this.lastSize = currentSize;
            }
        } catch (error) {
            console.error("Error handling file change:", error);
        }
    }

    broadcast(message) {
        this.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }

    sendToClient(client, message) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(`Server running at http://localhost:${this.port}/log`);
        });
    }
}

new LogTailServer(3000).start();
