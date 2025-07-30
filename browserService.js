import { spawn, execSync } from "child_process";

export class BrowserService {
    constructor() {
        this.processes = {
            chrome: null,
            edge: null,
        };
    }

    start(browser, url) {
        if (this.processes[browser]) {
            return `${browser} is already running.`;
        }

        let proc;
        if (browser === "chrome") {
            proc = spawn("google-chrome", ["--new-tab", url], {
                detached: true,
            });
        } else if (browser === "edge") {
            proc = spawn("microsoft-edge", ["--new-tab", url], {
                detached: true,
            });
        } else {
            return "Unsupported browser.";
        }

        this.processes[browser] = proc;
        return `${browser} started with URL ${url}`;
    }

    stop(browser) {
        if (!this.processes[browser]) return `${browser} is not running.`;

        try {
            if (browser === "edge") {
                execSync(`pkill -9 -f msedge`, { stdio: "ignore" });
            } else if (browser === "chrome") {
                execSync(`pkill -9 -f chrome`, { stdio: "ignore" });
            } else {
                return "Unsupported browser.";
            }
        } catch (err) {
            // pkill returns non-zero exit code when no processes are found
            // This is expected behavior, so we can ignore this error
        }

        this.processes[browser] = null;
        return `${browser} stopped.`;
    }

    getActiveTab(browser) {
        try {
            if (browser === "chrome" || browser === "edge") {
                const processName = browser === "edge" ? "msedge" : "chrome";

                // Get the main browser process with URL in command line
                const psOutput = execSync(
                    `ps aux | grep -E "${processName}.*http" | grep -v grep | head -n 1`
                )
                    .toString()
                    .trim();

                if (!psOutput) {
                    return "No active tab found.";
                }

                // Extract URL from the command line using regex
                const urlMatch = psOutput.match(/https?:\/\/[^\s]+/);
                return urlMatch ? urlMatch[0] : "No active tab found.";
            }

            return "Unsupported browser.";
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
            } else if (browser === "edge") {
                execSync(`rm -rf ~/.config/microsoft-edge/Default/*`);
            } else {
                return "Unsupported browser.";
            }

            return `${browser} cleanup done.`;
        } catch (err) {
            return `Error during cleanup: ${err.message}`;
        }
    }
}
