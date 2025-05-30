import { App, DropdownComponent, Editor, FileSystemAdapter, ItemView, MarkdownFileInfo, MarkdownRenderer, MarkdownView, Menu, MenuItem, Modal, Notice, Platform, Setting, TFile, TFolder, TextFileView, View, WorkspaceLeaf } from "obsidian";

import { Acknowledgement } from "Acknowledgement";
import { Colorify } from "shapers/Colorify";
import { Command } from "Command";
import { Shaper } from "shapers/Shaper";
import { Utilities } from "Utilities";
import net from "net";

export class Server {

    className: string;
    shaperName: string;
    shaper: Shaper;
    containerEl: HTMLElement;
    containerView: View;

    classServer: net.Server;
    classSocket: net.socket;

    userTable: Map<string, string>;

    constructor(name: string, shapr: string, containerV: View) {

        this.className = name;
        this.shaperName = shapr;
        this.containerView = containerV;
        console.log("Creating server for "+this.className+" with shaper "+this.shaperName+" in container "+this.containerView);

        this.shaper = new Colorify(this.containerView);
        this.userTable = new Map<string, string>();

    }

    authorized (data: string): boolean {
        console.log("Authorizing "+data+" for "+this.className);
        return true;
    }

    async start() {

        console.log("Server class starting for "+this.className+".");

        this.classServer = net.createServer((socket: net.socket) => {
            console.log("Connection from", socket.remoteAddress, "port", socket.remotePort);
            this.classSocket = socket;

            socket.on("data", (buffer: Buffer) => {
                console.log("Request from", socket.remoteAddress, "port", socket.remotePort);
                const command = new Command(buffer, socket.remoteAddress);
                const data = command.getData();

                if (command.getCommand() === Command.REQUEST_TO_JOIN) {
                    console.log("Request to join from", socket.remoteAddress, "port", socket.remotePort);
                    if (this.authorized(data)) {
                        console.log("Authorized to join from", socket.remoteAddress, "port", socket.remotePort);
                        const userName = data; 
                        this.userTable.set(socket.remoteAddress, userName);
                    } else {
                        console.log("Not authorized to join from", socket.remoteAddress, "port", socket.remotePort);
                        Acknowledgement.send(socket, Acknowledgement.NOT_AUTHORIZED_TO_JOIN);
                        return;
                    }

                } else if (command.getCommand() === Command.DUMP) {
                    console.log("Dump from", socket.remoteAddress, "port", socket.remotePort);
                    let dumpstring = "";
                    for (const [key, value] of this.userTable.entries()) {
                        dumpstring += key + " " + value + "\n";
                    }
                    console.log("Dump: "+dumpstring);
                    
                } else if (command.getCommand() === Command.TEXT) {
                    console.log("Text from", socket.remoteAddress, "port", socket.remotePort);
                    let userName = "";

                    if (this.userTable.has(socket.remoteAddress)) {
                        const u = this.userTable.get(socket.remoteAddress); 
                        userName = u !== undefined ? u : "";   
                    } else {
                        console.log("Not authorized to send text from", socket.remoteAddress, "port", socket.remotePort);
                        Acknowledgement.send(socket, Acknowledgement.NOT_AUTHORIZED_FOR_TEXT);
                        return;
                    }

                    console.log("Text: "+data);
                    this.shaper.shapeThis(userName, data);
                    Acknowledgement.send(socket, Acknowledgement.OK);   

                } else if (command.getCommand() === Command.QUIT) {
                    console.log("Quit from", socket.remoteAddress, "port", socket.remotePort);
                }
            });
        })

        this.classServer.listen(59898, () => {
            console.log("Server listening on port 59898");
        });

        this.classServer.maxConnections = 20;
        
        this.run();

    }

    run() {

    }

    stop() {
        if (this.classSocket !== undefined) {
            this.classSocket.destroy();
        }
    }

    stopped(): boolean {
        if (this.classSocket === undefined) {
            return true;
        } else {
            return this.classSocket.destroyed;
        }
    }

    handleMyKeys(key: string) {
        console.log("Key pressed: " + key);
        this.shaper.shapeThis("Server", key);
    }
    

}