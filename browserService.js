import { spawn, execSync } from "child_process";
import fs from "fs";

export class BrowserService {
    constructor() {
        this.processes = {
            chrome: null,
            firefox: null,
        };
    }

    start(browser, url) {
        if (this.processes[browser]) {
            return `${browser} is already running.`;
        }

        let proc;
        if (browser === "chrome") {
            proc = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", ["--new-window", url], {
                detached: true,
            });
        } else if (browser === "firefox") {
            proc = spawn("firefox", [url], { detached: true });
        } else {
            return "Unsupported browser.";
        }

        this.processes[browser] = proc;
        return `${browser} started with URL ${url}`;
    }

    stop(browser) {
        if (!this.processes[browser]) return `${browser} is not running.`;

        try {
            execSync(`pkill ${browser}`);
            this.processes[browser] = null;
            return `${browser} stopped.`;
        } catch (err) {
            return `Error stopping ${browser}: ${err.message}`;
        }
    }

    getActiveTab(browser) {
        try {
            if (browser === "chrome") {
                const output = execSync(
                    `lsof -c chrome | grep -o 'http[s]*://[^ ]*' | head -n 1`
                )
                    .toString()
                    .trim();
                return output || "No active tab found.";
            } else if (browser === "firefox") {
                const sessionPath = `${process.env.HOME}/.mozilla/firefox/`;
                const profiles = fs
                    .readdirSync(sessionPath)
                    .filter(
                        (f) =>
                            f.endsWith(".default") ||
                            f.endsWith(".default-release")
                    );
                const profilePath =
                    profiles.length > 0
                        ? `${sessionPath}${profiles[0]}/sessionstore-backups/recovery.jsonlz4`
                        : null;

                if (profilePath && fs.existsSync(profilePath)) {
                    return "Active tab fetching not implemented fully for Firefox (requires decoding JSONLZ4).";
                }
                return "No session found.";
            } else {
                return "Unsupported browser.";
            }
        } catch {
            return "Could not determine active tab.";
        }
    }

    cleanup(browser) {
        if (this.processes[browser]) {
            return `Cannot cleanup. ${browser} is still running.`;
        }

        try {
            if (browser === "chrome") {
                execSync(`rm -rf ~/.config/google-chrome/Default/*`);
            } else if (browser === "firefox") {
                execSync(`rm -rf ~/.mozilla/firefox/*.default*`);
            } else {
                return "Unsupported browser.";
            }

            return `${browser} cleanup done.`;
        } catch (err) {
            return `Error during cleanup: ${err.message}`;
        }
    }
}
