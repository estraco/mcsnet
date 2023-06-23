import EventEmitter from 'events';
import { Socket } from 'net';

export default class AsyncSocket {
    socket: Socket;
    readBuffer: Buffer[] = [];
    emitter: EventEmitter = new EventEmitter();

    waitCount = 0;
    connected = false;

    constructor(socket: Socket) {
        this.socket = socket;

        this.socket.on('data', (data) => {
            if (this.waitCount > 0) {
                this.emitter.emit('data', data);
            } else {
                this.readBuffer.push(data);
            }
        });

        this.socket.on('connect', () => {
            if (this.connected) {
                return;
            }

            this.emitter.emit('connect');

            this.connected = true;
        });

        this.socket.on('close', () => {
            this.connected = false;
        });
    }

    async get(): Promise<Buffer> {
        if (this.readBuffer.length > 0) {
            return this.readBuffer.shift()!;
        }

        return new Promise((resolve) => {
            this.waitCount++;

            this.emitter.once('data', (data) => {
                this.waitCount--;

                resolve(data);
            });
        });
    }

    async getMany(count: number): Promise<Buffer[]> {
        const result: Buffer[] = [];

        while (result.length < count) {
            const data = await this.get();

            result.push(data);
        }

        return result;
    }

    async waitUntilConnected(): Promise<void> {
        if (this.connected) {
            return;
        }

        return new Promise((resolve) => {
            this.emitter.once('connect', resolve);
        });
    }
}
