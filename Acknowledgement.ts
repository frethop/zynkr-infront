import { net } from "net";

export class Acknowledgement {

    static readonly OK = 0x00;
    static readonly NOT_AUTHORIZED_FOR_TEXT = 0x01;
    static readonly NOT_AUTHORIZED_TO_JOIN = 0x02;

    constructor() {
        console.log("Acknowledgement class created.");
    }

    static send(socket: net.Socket, ack: number) {
        const buffer = Buffer.alloc(1);
        buffer[0] = ack & 0xFF; // Ensure we only use the last byte
        socket.write(buffer);
        console.log("Acknowledgement sent.");
    }
    
}
