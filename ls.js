import fs from "fs";
import path from "path";

class LsUtility {
    constructor(
        dirPath = ".",
        options = { showHidden: false, longFormat: false }
    ) {
        this.dirPath = dirPath;
        this.showHidden = options.showHidden;
        this.longFormat = options.longFormat;
    }

    run() {
        fs.readdir(this.dirPath, { withFileTypes: true }, (err, items) => {
            if (err) {
                console.error(`❌ Error: ${err.message}`);
                return;
            }

            items.forEach((item) => {
                if (!this.showHidden && item.name.startsWith(".")) return;

                if (this.longFormat) {
                    const fullPath = path.join(this.dirPath, item.name);
                    const stats = fs.statSync(fullPath);

                    const size = stats.size.toString().padStart(8);
                    const mtime = stats.mtime.toISOString();
                    const type = item.isDirectory() ? "d" : "-";

                    console.log(`${type} ${size} ${mtime} ${item.name}`);
                } else {
                    console.log(item.name);
                }
            });
        });
    }
}

// 🔽 Command-line Usage:
// node ls.js -a -f
const args = process.argv.slice(2);
const showHidden = args.includes("-a");
const longFormat = args.includes("-f");
const dirArg = args.find(arg => !arg.startsWith("-")) || ".";

const ls = new LsUtility(dirArg, { showHidden, longFormat });
ls.run();


// // 🔽 Example Usage:
// const ls = new LsUtility(".", { showHidden: false, longFormat: false });
// ls.run();
