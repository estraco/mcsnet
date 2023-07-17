import fs from 'fs';
import os from 'os';

export type Server = {
    public_address: string;
    private_address: string;
    port: number;
    ip_forwarding?: boolean;
    // TODO: finish adding support for a websocket mode
    use_websocket?: boolean;
    websocket_port?: number;
    websocket_host?: string;
}

export type Configuration = {
    servers: Server[];
    error_file?: string;
    listen_port: number;
    listen_address?: string;
}

export default class Config {
    private _config: Configuration;

    public constructor(config_file: string) {
        this._config = JSON.parse(fs.readFileSync(config_file).toString());

        if (!this.validate()) {
            throw new Error('Invalid configuration');
        }

        const server = this.check_listen_loop();

        if (server) {
            throw new Error(`Invalid listen address - server \`${server.public_address} -> ${server.private_address}:${server.port}\` will loop back to the proxy, causing a stack overflow and crashing the proxy`);
        }
    }

    public validate(): boolean {
        if (this._config.servers.length < 1) {
            console.error('No servers defined');

            return false;
        }

        for (const server of this._config.servers) {
            if (!server.public_address) {
                console.error('No public address defined for server');

                return false;
            }

            if (typeof server.public_address !== 'string') {
                console.error('Public address is not a string');

                return false;
            }

            if (!server.private_address) {
                console.error('No private address defined for server');

                return false;
            }

            if (typeof server.private_address !== 'string') {
                console.error('Private address is not a string');

                return false;
            }

            if (!server.port) {
                console.error('No port defined for server');

                return false;
            }

            if (isNaN(server.port)) {
                console.error('Port is not a number');

                return false;
            }

            if (server.ip_forwarding && typeof server.ip_forwarding !== 'boolean') {
                console.error('IP forwarding is not a boolean');

                return false;
            }

            if (server.use_websocket && typeof server.use_websocket !== 'boolean') {
                console.error('Use websocket is not a boolean');

                return false;
            }

            if (server.websocket_port && isNaN(server.websocket_port)) {
                console.error('Websocket port is not a number');

                return false;
            }

            if (server.websocket_host && typeof server.websocket_host !== 'string') {
                console.error('Websocket host is not a string');

                return false;
            }

            if (server.use_websocket && !server.websocket_port) {
                console.error('Websocket port is not defined');

                return false;
            }
        }

        if (this._config.error_file && typeof this._config.error_file !== 'string') {
            console.error('Error file is not a string');

            return false;
        }

        if (!this._config.listen_port) {
            console.error('No listen port defined');

            return false;
        }

        if (isNaN(this._config.listen_port)) {
            console.error('Listen port is not a number');

            return false;
        }

        if (this._config.listen_address && typeof this._config.listen_address !== 'string') {
            console.error('Listen address is not a string');

            return false;
        }

        return true;
    }

    public check_listen_loop(): null | Server {
        // Check if the listen address is the same as any of the server addresses
        // If it is, then we have a loop, throw an error
        const ifaces = os.networkInterfaces();

        for (const iface in ifaces) {
            for (const address of ifaces[iface]) {
                // loop through each server and check if the address is the same and the port is the same
                for (const server of this.servers) {
                    if (server.private_address === address.address && server.port === this.listen_port) {
                        console.error('Connect address is the same as a server address');

                        return server;
                    }

                    if (server.websocket_host === address.address && server.websocket_port === this.listen_port) {
                        console.error('Websocket address is already in use by main proxy');

                        return server;
                    }
                }
            }
        }

        // check 0.0.0.0
        if (this.listen_address === '0.0.0.0' || this.listen_address === '::') {
            // check port of each server
            for (const server of this.servers) {
                if (Object.values(ifaces).some((iface) => iface.some((address) => address.address === server.private_address))) {
                    if (server.port === this.listen_port) {
                        console.error('Connect address is the same as a server address');

                        return server;
                    }
                }
            }
        }

        return null;
    }

    public get servers(): Server[] {
        return this._config.servers;
    }

    public get error_file(): string | undefined {
        return this._config.error_file;
    }

    public get listen_port(): number {
        return this._config.listen_port;
    }

    public get listen_address(): string {
        return this._config.listen_address || '0.0.0.0';
    }
}
