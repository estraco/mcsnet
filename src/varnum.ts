export default class VarInt {
    public static decodeVarInt(buffer: Buffer, offset = 0): { value: number, end: number, size: number, buffer: Buffer } {
        let numRead = 0;
        let result = 0;
        let byte = 0;
        let value = 0;

        do {
            byte = buffer.readUint8(offset++);

            value = (byte & 0b01111111);
            result |= value << (7 * numRead);

            numRead++;

            if (numRead > 5) throw new Error('varint too large');
        } while ((byte & 0b10000000) !== 0);

        return {
            value: result,
            end: offset,
            size: numRead,
            buffer: buffer.subarray(offset - numRead, offset)
        };
    }

    public static encodeVarInt(value: number): Buffer {
        const bytes: number[] = [];

        do {
            let temp = value & 0b01111111;

            value >>>= 7;

            if (value !== 0) {
                temp |= 0b10000000;
            }

            bytes.push(temp);
        } while (value !== 0);

        return Buffer.from(bytes);
    }

    public static decodeVarLong(buffer: Buffer, offset = 0): { value: bigint, end: number, size: number, buffer: Buffer } {
        let numRead = 0;
        let result = BigInt(0);
        let byte = 0;
        let value = BigInt(0);

        do {
            byte = buffer.readUint8(offset++);

            value = BigInt(byte & 0b01111111);
            result |= value << BigInt(7 * numRead);

            numRead++;

            if (numRead > 10) throw new Error('varint too large');
        } while ((byte & 0b10000000) !== 0);

        return {
            value: result,
            end: offset,
            size: numRead,
            buffer: buffer.subarray(offset - numRead, offset)
        };
    }

    public static encodeVarLong(value: bigint): Buffer {
        const bytes: number[] = [];

        do {
            let temp = value & BigInt(0b01111111);

            value >>= BigInt(7);

            if (value !== BigInt(0)) {
                temp |= BigInt(0b10000000);
            }

            bytes.push(Number(temp));
        } while (value !== BigInt(0));

        return Buffer.from(bytes);
    }
}
