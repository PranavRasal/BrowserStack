import express from "express";
import { BrowserService } from "./browserService.js";

const app = express();
const PORT = 3000;
const browserService = new BrowserService();

app.get("/start", (req, res) => {
    const { browser, url } = req.query;
    const result = browserService.start(browser, url);
    res.send(result);
});

app.get("/stop", (req, res) => {
    const { browser } = req.query;
    const result = browserService.stop(browser);
    res.send(result);
});

app.get("/active-tab", (req, res) => {
    const { browser } = req.query;
    const result = browserService.getActiveTab(browser);
    res.send(result);
});

app.get("/cleanup", (req, res) => {
    const { browser } = req.query;
    const result = browserService.cleanup(browser);
    res.send(result);
});

app.listen(PORT, () => {
    console.log(`🧠 Server running at http://localhost:${PORT}`);
});
