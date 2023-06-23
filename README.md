# MCSnet

This is a Bungeecord-like proxy server for Minecraft. This allows for multiple Minecraft servers to run on one machine on separate ports, but only use one port for connecting to them. The server you connect to is dependent on the connection address set on the client.

To set this up, you need to edit the `servers` object in `src/index.ts`. There is an example server already there.

This proxy requires the `bungeecord` option set to `true` in the `spigot.yml` file of the servers you want to connect to. This is because the proxy uses the Bungeecord handshake to determine which server to connect to.

Disabling user authentication, or setting `online-mode` to `false` in the `server.properties` file of the servers you want to connect to is not required, unlike Bungeecord. All that happens is the connection address is modified, and all subsequent packets are forwarded to the server, including the login packet.

## Requirements

- Node.js
- npm

## Installation

1. Clone the repository
    - `git clone https://github.com/1nchhh/mcsnet.git`
2. Install dependencies
    - `npm install`
3. Build the project
    - `npm run build`
4. Run the project
    - `npm run start`
