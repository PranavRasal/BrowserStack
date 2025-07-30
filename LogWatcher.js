import fs from 'fs';
import { EventEmitter } from 'events';

export class LogWatcher extends EventEmitter {
    constructor(filePath) {
        super();
        this.filePath = filePath;
        this.position = 0;
        this.watchInterval = 100; 
        this.start();
    }

    start() {
        fs.stat(this.filePath, (err, stats) => {
            if (err) return console.error('File stat error:', err);
            this.position = stats.size;
            this.watch();
        });
    }

    watch() {
        setInterval(() => {
            fs.stat(this.filePath, (err, stats) => {
                if (err) return;

                if (stats.size > this.position) {
                    const stream = fs.createReadStream(this.filePath, {
                        start: this.position,
                        end: stats.size,
                        encoding: 'utf8'
                    });

                    let buffer = '';
                    stream.on('data', chunk => buffer += chunk);
                    stream.on('end', () => {
                        this.position = stats.size;
                        this.emit('update', buffer);
                    });
                }
            });
        }, this.watchInterval);
    }

    getLastLines(n = 10) {
        const data = fs.readFileSync(this.filePath, 'utf8');
        return data.trim().split('\n').slice(-n).join('\n');
    }
}
