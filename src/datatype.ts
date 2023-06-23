import { ChatComponent } from './chat';
import VarInt from './varnum';

export type DataTypeNames = 'Boolean' | 'Byte' | 'UnsignedByte' | 'Short' | 'UnsignedShort' | 'Int' | 'Long' | 'Float' | 'Double' | 'String' | 'Chat' | 'Identifier' | 'VarInt' | 'VarLong' | 'EntityMetadata' | 'Slot' | 'NBT' | 'Position' | 'Angle' | 'UUID' | 'Optional' | 'Array' | 'Enum' | 'ByteArray';

export const DataTypes = {
    Boolean: {
        encode: (value: boolean) => {
            return Buffer.from([value ? 0x01 : 0x00]);
        },
        decode: (buffer: Buffer, offset = 0): { value: boolean, size: number, end: number, buffer: Buffer } => {
            return {
                value: buffer[offset] === 0x01,
                size: 1,
                end: offset + 1,
                buffer: buffer.subarray(offset, offset + 1)
            };
        }
    },
    Byte: {
        encode: (value: number) => {
            return Buffer.from([value]);
        },
        decode: (buffer: Buffer, offset = 0): { value: number, size: number, end: number, buffer: Buffer } => {
            return {
                value: buffer.readInt8(offset),
                size: 1,
                end: offset + 1,
                buffer: buffer.subarray(offset, offset + 1)
            };
        }
    },
    UnsignedByte: {
        encode: (value: number) => {
            return Buffer.from([value]);
        },
        decode: (buffer: Buffer, offset = 0): { value: number, size: number, end: number, buffer: Buffer } => {
            return {
                value: buffer.readUInt8(offset),
                size: 1,
                end: offset + 1,
                buffer: buffer.subarray(offset, offset + 1)
            };
        }
    },
    Short: {
        encode: (value: number) => {
            const buf = Buffer.alloc(2);

            buf.writeInt16BE(value);

            return buf;
        },
        decode: (buffer: Buffer, offset = 0): { value: number, size: number, end: number, buffer: Buffer } => {
            return {
                value: buffer.readInt16BE(offset),
                size: 2,
                end: offset + 2,
                buffer: buffer.subarray(offset, offset + 2)
            };
        }
    },
    UnsignedShort: {
        encode: (value: number) => {
            const buf = Buffer.alloc(2);

            buf.writeUInt16BE(value);

            return buf;
        },
        decode: (buffer: Buffer, offset = 0): { value: number, size: number, end: number, buffer: Buffer } => {
            return {
                value: buffer.readUInt16BE(offset),
                size: 2,
                end: offset + 2,
                buffer: buffer.subarray(offset, offset + 2)
            };
        }
    },
    Int: {
        encode: (value: number) => {
            const buf = Buffer.alloc(4);

            buf.writeInt32BE(value);

            return buf;
        },
        decode: (buffer: Buffer, offset = 0): { value: number, size: number, end: number, buffer: Buffer } => {
            return {
                value: buffer.readInt32BE(offset),
                size: 4,
                end: offset + 4,
                buffer: buffer.subarray(offset, offset + 4)
            };
        }
    },
    Long: {
        encode: (value: bigint) => {
            const buf = Buffer.alloc(8);

            buf.writeBigInt64BE(value);

            return buf;
        },
        decode: (buffer: Buffer, offset = 0): { value: bigint, size: number, end: number, buffer: Buffer } => {
            return {
                value: buffer.readBigInt64BE(offset),
                size: 8,
                end: offset + 8,
                buffer: buffer.subarray(offset, offset + 8)
            };
        }
    },
    Float: {
        encode: (value: number) => {
            const buf = Buffer.alloc(4);

            buf.writeFloatBE(value);

            return buf;
        },
        decode: (buffer: Buffer, offset = 0): { value: number, size: number, end: number, buffer: Buffer } => {
            return {
                value: buffer.readFloatBE(offset),
                size: 4,
                end: offset + 4,
                buffer: buffer.subarray(offset, offset + 4)
            };
        }
    },
    Double: {
        encode: (value: number) => {
            const buf = Buffer.alloc(8);

            buf.writeDoubleBE(value);

            return buf;
        },
        decode: (buffer: Buffer, offset = 0): { value: number, size: number, end: number, buffer: Buffer } => {
            return {
                value: buffer.readDoubleBE(offset),
                size: 8,
                end: offset + 8,
                buffer: buffer.subarray(offset, offset + 8)
            };
        }
    },
    String: {
        encode: (value: string) => {
            if (value.length > 32767) throw new Error('String too long');

            const buf = Buffer.from(value, 'utf8');

            return Buffer.concat([DataTypes.VarInt.encode(buf.length), buf]);
        },
        decode: (buffer: Buffer, offset = 0): { value: string, size: number, end: number, buffer: Buffer } => {
            const { value: length, size } = DataTypes.VarInt.decode(buffer, offset);
            const value = buffer.subarray(offset + size, offset + size + length).toString('utf8');

            return {
                value,
                size: size + length,
                end: offset + size + length,
                buffer: buffer.subarray(offset, offset + size + length)
            };
        }
    },
    Chat: {
        encode: (value: ChatComponent) => {
            const buf = Buffer.from(JSON.stringify(value), 'utf8');

            if (buf.length > 262144) throw new Error('Chat string too long');

            return Buffer.concat([DataTypes.VarInt.encode(buf.length), buf]);
        },
        decode: (buffer: Buffer, offset = 0): { value: ChatComponent, size: number, end: number, buffer: Buffer } => {
            const { value: length, size } = DataTypes.VarInt.decode(buffer, offset);
            const value = buffer.subarray(offset + size, offset + size + length).toString('utf8');

            return {
                value: JSON.parse(value),
                size: size + length,
                end: offset + size + length,
                buffer: buffer.subarray(offset, offset + size + length)
            };
        }
    },
    Identifier: {
        encode: (value: string) => {
            if (value.length > 32767) throw new Error('Identifier string too long');

            const buf = Buffer.from(value, 'utf8');

            return Buffer.concat([DataTypes.VarInt.encode(buf.length), buf]);
        },
        decode: (buffer: Buffer, offset = 0): { value: string, size: number, end: number, buffer: Buffer } => {
            const { value: length, size } = DataTypes.VarInt.decode(buffer, offset);
            const value = buffer.subarray(offset + size, offset + size + length).toString('utf8');

            return {
                value,
                size: size + length,
                end: offset + size + length,
                buffer: buffer.subarray(offset, offset + size + length)
            };
        }
    },
    VarInt: {
        encode: VarInt.encodeVarInt,
        decode: VarInt.decodeVarInt
    },
    VarLong: {
        encode: VarInt.encodeVarLong,
        decode: VarInt.decodeVarLong
    },
    EntityMetadata: {
        encode: (value: Buffer) => {
            return value;
        },
        decode: (buffer: Buffer, offset = 0): { value: Buffer, size: number, end: number, buffer: Buffer } => {
            const { value: length, size } = DataTypes.VarInt.decode(buffer, offset);
            const value = buffer.subarray(offset + size, offset + size + length);

            return {
                value,
                size: size + length,
                end: offset + size + length,
                buffer: buffer.subarray(offset, offset + size + length)
            };
        }
    },
    Slot: {
        encode: (value: Buffer) => {
            return value;
        },
        decode: (buffer: Buffer, offset = 0): { value: Buffer, size: number, end: number, buffer: Buffer } => {
            const { value: length, size } = DataTypes.VarInt.decode(buffer, offset);
            const value = buffer.subarray(offset + size, offset + size + length);

            return {
                value,
                size: size + length,
                end: offset + size + length,
                buffer: buffer.subarray(offset, offset + size + length)
            };
        }
    },
    NBT: {
        encode: (value: Buffer) => {
            return value;
        },
        decode: (buffer: Buffer, offset = 0): { value: Buffer, size: number, end: number, buffer: Buffer } => {
            const { value: length, size } = DataTypes.VarInt.decode(buffer, offset);
            const value = buffer.subarray(offset + size, offset + size + length);

            return {
                value,
                size: size + length,
                end: offset + size + length,
                buffer: buffer.subarray(offset, offset + size + length)
            };
        }
    },
    Position: {
        encode: (value: Buffer) => {
            const buf = Buffer.alloc(8);

            buf.writeInt32BE(value.readInt32BE(0) >> 6);
            buf.writeInt32BE(value.readInt32BE(4) >> 6, 4);

            return buf;
        },
        decode: (buffer: Buffer, offset = 0): { value: Buffer, size: number, end: number, buffer: Buffer } => {
            const value = Buffer.alloc(8);

            value.writeInt32BE(buffer.readInt32BE(offset) << 6);
            value.writeInt32BE(buffer.readInt32BE(offset + 4) << 6, 4);

            return {
                value,
                size: 8,
                end: offset + 8,
                buffer: buffer.subarray(offset, offset + 8)
            };
        }
    },
    Angle: {
        encode: (value: number) => {
            const buf = Buffer.alloc(1);

            buf.writeUInt8(Math.round(value * 256 / 360));

            return buf;
        },
        decode: (buffer: Buffer, offset = 0): { value: number, size: number, end: number, buffer: Buffer } => {
            const value = buffer.readUInt8(offset) * 360 / 256;

            return {
                value,
                size: 1,
                end: offset + 1,
                buffer: buffer.subarray(offset, offset + 1)
            };
        }
    },
    UUID: {
        encode: (value: bigint) => {
            const buf = Buffer.alloc(16);

            buf.writeBigUInt64BE(value >> BigInt(64), 0);
            buf.writeBigUInt64BE(value & BigInt('0xFFFFFFFFFFFFFFFF'), 8);

            return buf;
        },
        decode: (buffer: Buffer, offset = 0): { value: bigint, size: number, end: number, buffer: Buffer, string_repr: string } => {
            const value = buffer.readBigUInt64BE(offset) << BigInt(64) | buffer.readBigUInt64BE(offset + 8);
            const string_repr = value.toString(16).padStart(32, '0');

            return {
                value,
                size: 16,
                end: offset + 16,
                buffer: buffer.subarray(offset, offset + 16),
                string_repr
            };
        }
    },
    Optional: {
        encode: (value: Buffer) => {
            return value;
        },
        decode: (buffer: Buffer, offset = 0): { value: Buffer, size: number, end: number, buffer: Buffer } => {
            const { value: length, size } = DataTypes.VarInt.decode(buffer, offset);
            const value = buffer.subarray(offset + size, offset + size + length);

            return {
                value,
                size: size + length,
                end: offset + size + length,
                buffer: buffer.subarray(offset, offset + size + length)
            };
        }
    },
    Array: {
        encode: (value: Buffer[]) => {
            return Buffer.concat(value);
        },
        decode: (buffer: Buffer, elSize: number, offset = 0): { value: Buffer[], size: number, end: number, buffer: Buffer } => {
            const value: Buffer[] = [];
            let size = 0;

            for (let i = 0; i < length; i++) {
                const data = buffer.subarray(offset + size, offset + size + elSize);

                value.push(data);
                size += elSize;
            }

            return {
                value,
                size: size + length,
                end: offset + size + length,
                buffer: buffer.subarray(offset, offset + size + length)
            };
        }
    },
    Enum: {
        encode: (value: Buffer) => {
            return value;
        },
        decode: (buffer: Buffer, size: number, offset = 0): { value: Buffer, size: number, end: number, buffer: Buffer } => {
            const value = buffer.subarray(offset, offset + size);

            return {
                value,
                size,
                end: offset + size,
                buffer: buffer.subarray(offset, offset + size)
            };
        }
    },
    ByteArray: {
        encode: (value: Buffer) => {
            return value;
        },
        decode: (buffer: Buffer, size: number, offset = 0): { value: Buffer, size: number, end: number, buffer: Buffer } => {
            const value = buffer.subarray(offset, offset + size);

            return {
                value,
                size,
                end: offset + size,
                buffer: buffer.subarray(offset, offset + size)
            };
        }
    }
};
