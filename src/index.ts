import net from 'net';
import Packet from './packet';
import { DataTypes } from './datatype';
import VarInt from './varnum';
import ip6addr from 'ip6addr';
import AsyncSocket from './asyncSocket';

export type Server = {
    public_address: string;
    private_address: string;
    port: number;
}

const config: {
    servers: Server[];
} = {
    servers: [
        {
            public_address: 'localhost',
            private_address: '127.0.0.1',
            port: 25560
        }
    ]
};

export enum ConnectionState {
    Handshake = 0,
    Status = 1,
    Login = 2,
    Play = 3
}

function createDisconnect(reason: string) {
    const jsonObj = {
        text: reason
    };

    const json = JSON.stringify(jsonObj);

    const newPacket = new Packet(0, DataTypes.String.encode(json));

    return newPacket.toBuffer();
}

function sanitizeAddress(address: string) {
    const addr = ip6addr.parse(address);

    if (addr.kind() === 'ipv6') {
        const strip = address.indexOf('%');

        return strip === -1 ? address : address.substring(0, strip);
    } else {
        return address;
    }
}

const server = net.createServer(async (socket) => {
    socket.on('error', (err) => {
        console.log(`\x1b[31m[${new Date().toLocaleString()}] \x1b[0m ${err}`);
    });

    const asyncSocket = new AsyncSocket(socket);

    console.log(`\x1b[32m[${new Date().toLocaleString()}] \x1b[35m${socket.remoteAddress}:${socket.remotePort} \x1b[36m${socket.localAddress}:${socket.localPort}\x1b[0m Connected, waiting for handshake...`);

    const handshakePacket = await asyncSocket.get();

    const handshake = Packet.fromBuffer(handshakePacket);

    console.log(`\x1b[32m[${new Date().toLocaleString()}] \x1b[35m${socket.remoteAddress}:${socket.remotePort} \x1b[36m${socket.localAddress}:${socket.localPort}\x1b[0m Got handshake packet`);

    const protocolVersion = VarInt.decodeVarInt(handshake.data);
    const serverAddress = DataTypes.String.decode(handshake.data, protocolVersion.end);
    const serverPort = DataTypes.UnsignedShort.decode(handshake.data, serverAddress.end);
    const nextState = VarInt.decodeVarInt(handshake.data, serverPort.end);

    console.log(`\x1b[32m[${new Date().toLocaleString()}] \x1b[35m${socket.remoteAddress}:${socket.remotePort} \x1b[36m${socket.localAddress}:${socket.localPort}\x1b[0m Protocol version: ${protocolVersion.value}`);
    console.log(`\x1b[32m[${new Date().toLocaleString()}] \x1b[35m${socket.remoteAddress}:${socket.remotePort} \x1b[36m${socket.localAddress}:${socket.localPort}\x1b[0m Server address: ${serverAddress.value}`);
    console.log(`\x1b[32m[${new Date().toLocaleString()}] \x1b[35m${socket.remoteAddress}:${socket.remotePort} \x1b[36m${socket.localAddress}:${socket.localPort}\x1b[0m Server port: ${serverPort.value}`);
    console.log(`\x1b[32m[${new Date().toLocaleString()}] \x1b[35m${socket.remoteAddress}:${socket.remotePort} \x1b[36m${socket.localAddress}:${socket.localPort}\x1b[0m Next state: ${nextState.value}`);

    const requestedServer = config.servers.find((server) => server.public_address === serverAddress.value);

    if (!requestedServer) {
        console.log(`\x1b[31m[${new Date().toLocaleString()}] \x1b[35m${socket.remoteAddress}:${socket.remotePort} \x1b[36m${socket.localAddress}:${socket.localPort}\x1b[0m Server not found`);

        nextState.value === ConnectionState.Login && socket.write(createDisconnect('Server not found'));

        socket.end();

        return;
    }

    if (nextState.value !== ConnectionState.Login) {
        // connect to server and pipe data
        console.log(`\x1b[32m[${new Date().toLocaleString()}] \x1b[35m${socket.remoteAddress}:${socket.remotePort} \x1b[36m${socket.localAddress}:${socket.localPort}\x1b[0m State is not login, connecting to server...`);

        const serverSocket = net.createConnection({
            host: requestedServer.private_address,
            port: requestedServer.port
        });

        serverSocket.pipe(socket);

        for (let i = 0; i < asyncSocket.readBuffer.length; i++) {
            serverSocket.write(asyncSocket.readBuffer[i]);
        }

        socket.pipe(serverSocket);

        serverSocket.on('error', (err) => {
            console.log(`\x1b[31m[${new Date().toLocaleString()}] \x1b[0m ${err}`);

            socket.end();
        });

        serverSocket.on('connect', () => {
            console.log(`\x1b[32m[${new Date().toLocaleString()}] \x1b[35m${serverSocket.remoteAddress}:${serverSocket.remotePort} \x1b[36m${serverSocket.localAddress}:${serverSocket.localPort}\x1b[0m Connected, piping data...`);

            serverSocket.write(handshakePacket);
        });

        return;
    }

    let loginPacket: Buffer;

    console.log(`\x1b[32m[${new Date().toLocaleString()}] \x1b[35m${socket.remoteAddress}:${socket.remotePort} \x1b[36m${socket.localAddress}:${socket.localPort}\x1b[0m Getting login data...`);

    if (handshakePacket.length > (nextState.end + 2)) {
        console.log(`\x1b[32m[${new Date().toLocaleString()}] \x1b[35m${socket.remoteAddress}:${socket.remotePort} \x1b[36m${socket.localAddress}:${socket.localPort}\x1b[0m Handshake packet has extra data, extracting login packet...`);

        loginPacket = handshakePacket.subarray(nextState.end + 2);
    } else {
        console.log(`\x1b[32m[${new Date().toLocaleString()}] \x1b[35m${socket.remoteAddress}:${socket.remotePort} \x1b[36m${socket.localAddress}:${socket.localPort}\x1b[0m Getting login packet...`);

        loginPacket = await asyncSocket.get();
    }

    const login = Packet.fromBuffer(loginPacket);

    const username = DataTypes.String.decode(login.data);
    const hasUUID = DataTypes.Boolean.decode(login.data, username.end);

    if (!hasUUID.value) {
        console.log(`\x1b[31m[${new Date().toLocaleString()}] \x1b[35m${socket.remoteAddress}:${socket.remotePort} \x1b[36m${socket.localAddress}:${socket.localPort}\x1b[0m Client does not have UUID`);

        socket.write(createDisconnect('Client does not have UUID'));

        socket.end();

        return;
    }

    const uuid = DataTypes.UUID.decode(login.data, hasUUID.end);

    const serverSocket = net.createConnection({
        host: requestedServer.private_address,
        port: requestedServer.port
    });

    serverSocket.on('error', (err) => {
        console.log(`\x1b[31m[${new Date().toLocaleString()}] \x1b[0m ${err}`);

        socket.end();
    });

    const serverAsyncSocket = new AsyncSocket(serverSocket);

    await serverAsyncSocket.waitUntilConnected();

    console.log(`\x1b[32m[${new Date().toLocaleString()}] \x1b[35m${serverSocket.remoteAddress}:${serverSocket.remotePort} \x1b[36m${serverSocket.localAddress}:${serverSocket.localPort}\x1b[0m Connected, editing handshake packet...`);

    const newHost = Buffer.concat([
        serverAddress.buffer,
        Buffer.from([0x00]),
        Buffer.from(sanitizeAddress(socket.remoteAddress)),
        Buffer.from([0x00]),
        Buffer.from(uuid.string_repr)
    ]);

    const newHandshake = new Packet(0, Buffer.concat([
        VarInt.encodeVarInt(protocolVersion.value),
        DataTypes.String.encode(newHost.toString()),
        DataTypes.UnsignedShort.encode(serverPort.value),
        VarInt.encodeVarInt(nextState.value)
    ]));

    console.log(`\x1b[32m[${new Date().toLocaleString()}] \x1b[35m${serverSocket.remoteAddress}:${serverSocket.remotePort} \x1b[36m${serverSocket.localAddress}:${serverSocket.localPort}\x1b[0m Edited handshake packet, stating pipe from server to client...`);

    serverSocket.pipe(socket);

    console.log(`\x1b[32m[${new Date().toLocaleString()}] \x1b[35m${serverSocket.remoteAddress}:${serverSocket.remotePort} \x1b[36m${serverSocket.localAddress}:${serverSocket.localPort}\x1b[0m Edited handshake packet, sending to server...`);

    serverSocket.write(newHandshake.toBuffer());

    console.log(`\x1b[32m[${new Date().toLocaleString()}] \x1b[35m${serverSocket.remoteAddress}:${serverSocket.remotePort} \x1b[36m${serverSocket.localAddress}:${serverSocket.localPort}\x1b[0m Sent handshake packet to server, sending login packet...`);

    serverSocket.write(loginPacket);

    console.log(`\x1b[32m[${new Date().toLocaleString()}] \x1b[35m${serverSocket.remoteAddress}:${serverSocket.remotePort} \x1b[36m${serverSocket.localAddress}:${serverSocket.localPort}\x1b[0m Finished packet modification, piping data...`);

    socket.pipe(serverSocket);
});

server.listen(25565, () => {
    console.log(`\x1b[32m[${new Date().toLocaleString()}] \x1b[0m Listening on port 25565`);
});
