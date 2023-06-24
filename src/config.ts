import fs from 'fs';

export type Server = {
    public_address: string;
    private_address: string;
    port: number;
    ip_forwarding?: boolean;
}

export type Configuration = {
    servers: Server[];
    error_file?: string;
}

export default class Config {
    private _config: Configuration;

    public constructor(config_file: string) {
        this._config = JSON.parse(fs.readFileSync(config_file).toString());

        if (!this.validate()) {
            throw new Error('Invalid configuration');
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
        }

        if (this._config.error_file && typeof this._config.error_file !== 'string') {
            console.error('Error file is not a string');

            return false;
        }

        return true;
    }

    public get servers(): Server[] {
        return this._config.servers;
    }

    public get error_file(): string | undefined {
        return this._config.error_file;
    }
}
