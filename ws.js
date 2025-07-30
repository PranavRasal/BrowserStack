import fs from "fs";

const file = process.argv[2];
if (!file) {
    console.error("Usage: node wc-stream.js <file>");
    process.exit(1);
}

let lines = 0,
    words = 0,
    bytes = 0;
let inWord = false;


const stream = fs.createReadStream(file, {
    encoding: "utf8",
    highWaterMark: 4 * 1024 * 1024,
});


stream.on("data", (chunk) => {
    bytes += Buffer.byteLength(chunk);

    for (let i = 0; i < chunk.length; i++) {
        const ch = chunk[i];

        if (ch === "\n") lines++;

        if (/\S/.test(ch)) {
            // not whitespace
            if (!inWord) {
                words++;
                inWord = true;
            }
        } else {
            inWord = false;
        }
    }
});

stream.on("end", () => {
    console.log(`${lines} ${words} ${bytes} ${file}`);
});

stream.on("error", (err) => {
    console.error(`Error: ${err.message}`);
});
