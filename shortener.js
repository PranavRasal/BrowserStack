import express from "express";
import { nanoid } from "nanoid";

const app = express();
const urlMap = new Map();
const PORT = 3000;

app.use(express.json());

app.post("/shorten", (req, res) => {
    const { url } = req.body;

    if (!url) {
        res.send({
            status: 400,
            error: "url is not defined",
        });
    }

    const urlCode = nanoid(6);
    urlMap.set(urlCode, url);
    res.json({
        message: `visit at http://localhost:${PORT}/${urlCode}`,
    });
});

app.get("/:code", (req, res) => {
    const { code } = req.params;
    if (!code) {
        return res.status(400).json({ error: "code is undefined" });
    }
    const url = urlMap.get(code);
    if (url) {
        res.redirect(url);
    } else {
        res.status(404).json({ error: "Short URL not found" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
