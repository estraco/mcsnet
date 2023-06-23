import VarInt from './varnum';

export default class Packet {
    id: number;
    data: Buffer;

    constructor(id: number, data: Buffer) {
        this.id = id;
        this.data = data;
    }

    static fromBuffer(buffer: Buffer): Packet {
        const length = VarInt.decodeVarInt(buffer);
        const id = VarInt.decodeVarInt(buffer, length.end);
        const data = buffer.subarray(id.end);

        return new Packet(id.value, data);
    }

    toBuffer(): Buffer {
        const length = VarInt.encodeVarInt(this.data.length + VarInt.encodeVarInt(this.id).length);
        const id = VarInt.encodeVarInt(this.id);

        return Buffer.concat([length, id, this.data]);
    }
}
