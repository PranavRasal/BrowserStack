import fs from "fs";

class WordSearcher {
    constructor(filePath, wordToFind) {
        this.filePath = filePath;
        this.wordToFind = wordToFind.toLowerCase();
        this.chunkOverlap = ""; // For handling words split across chunks
    }

    search() {
        const stream = fs.createReadStream(this.filePath, {
            encoding: "utf8",
            highWaterMark: 1024 * 1024 * 4, // 4MB per chunk
        });

        stream.on("data", (chunk) => {
            const combinedChunk = this.chunkOverlap + chunk;
            const lowerText = combinedChunk.toLowerCase();

            if (lowerText.includes(this.wordToFind)) {
                console.log(`✅ Found "${this.wordToFind}"`);
            }

            // Save the last few characters for next chunk
            this.chunkOverlap = chunk.slice(-this.wordToFind.length);
        });

        stream.on("end", () => {
            console.log("🔍 Search completed.");
        });

        stream.on("error", (err) => {
            console.error("❌ Error:", err.message);
        });
    }
}

// 🔽 Demo Usage
const searcher = new WordSearcher("log.txt", "WARNINGj");
searcher.search();
