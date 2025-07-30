import fs from "fs";
import path from "path";

class PsUtility {
    constructor() {
        this.procPath = "/proc";
    }

    isNumeric(str) {
        return /^\d+$/.test(str);
    }

    readCmdline(pid) {
        try {
            const data = fs.readFileSync(
                path.join(this.procPath, pid, "cmdline"),
                "utf8"
            );
            return data.replace(/\0/g, " ").trim() || "[unknown]";
        } catch {
            return "[unreadable]";
        }
    }

    readStatus(pid) {
        try {
            const statusPath = path.join(this.procPath, pid, "status");
            const lines = fs.readFileSync(statusPath, "utf8").split("\n");
            const nameLine = lines.find((line) => line.startsWith("Name:"));
            return nameLine?.split("\t")[1] || "[unknown]";
        } catch {
            return "[unreadable]";
        }
    }

    listProcesses() {
        const entries = fs.readdirSync(this.procPath);
        const pids = entries.filter(this.isNumeric);

        console.log(`PID\tCOMMAND\t\t\tCMDLINE`);
        console.log("----\t----------------\t----------------------------");

        pids.forEach((pid) => {
            const name = this.readStatus(pid);
            const cmdline = this.readCmdline(pid);
            console.log(`${pid}\t${name.padEnd(16)}\t${cmdline}`);
        });
    }
}

// 🔽 Run
const ps = new PsUtility();
ps.listProcesses();
