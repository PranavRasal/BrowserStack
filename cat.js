// cat.js
import fs from "fs";
import path from "path";

const args = process.argv.slice(2);

if (args.length === 0) {
    console.error("Usage: node cat.js <file1> [file2 ...]");
    process.exit(1);
}

for (const file of args) {
    const filePath = path.resolve(file);
    try {
        const data = fs.readFileSync(filePath, "utf8");
        process.stdout.write(data);
    } catch (err) {
        console.error(`cat: ${file}: ${err.message}`);
    }
}

