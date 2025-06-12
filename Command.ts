export class Command {

    static readonly CHECK = 0xFE;
    static readonly DUMP = 0xFF;
    static readonly QUIT = 0x00;
    static readonly REQUEST_TO_JOIN = 0x01;
    static readonly TEXT = 0x02;
    static readonly CONTENTS = 0x03;
    
    commandByte: number;
    source: string;
    length: number;
    data: string;

    constructor(buffer: Buffer, src: string) {
        this.commandByte = buffer[0];
        this.source = src;
        this.length = buffer.byteLength;
        this.data = buffer.slice(2, buffer.length).toString("utf-8").trim();
    }

    getCommand() {
        return this.commandByte;
    }
    getSource() {
        return this.source;
    }
    getLength() {
        return this.length;
    }
    getData() {
        return this.data;
    }    
}