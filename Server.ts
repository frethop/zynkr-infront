import { App, DropdownComponent, Editor, FileSystemAdapter, ItemView, MarkdownFileInfo, MarkdownRenderer, MarkdownView, Menu, MenuItem, Modal, Notice, Platform, Setting, TFile, TFolder, TextFileView, View, WorkspaceLeaf } from "obsidian";

import { Acknowledgement } from "Acknowledgement";
import { Box } from "shapers/Box";
import { Colorify } from "shapers/Colorify";
import { Command } from "Command";
import { Shaper } from "shapers/Shaper";
import Utilities from "Utilities";
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
    error: number;

    constructor(app: App, name: string, shapr: string, containerV: View) {

        this.className = name;
        this.shaperName = shapr;
        this.containerView = containerV;
        console.log("Creating server for "+this.className+" with shaper "+this.shaperName+" in container "+this.containerView);

        switch (this.shaperName) {
            case "Colorify":
                console.log("Using Colorify shaper.");
                this.shaper = new Colorify(this.containerView);
                break;
            case "Box":
                console.log("Using Box shaper.");
                this.shaper = new Box(this.containerView);
                break;
        }
        this.userTable = new Map<string, string>();

        this.error = 0;
        const file = app.vault.getAbstractFileByPath(this.className+'-auth.md');
        app.vault.read( file as TFile) .then((content: string) => {
            console.log("Read file: " + content);
            const lines = content.split("\n");
            for (const line of lines) {
                this.userTable.set(line.trim(), "");
            }
        }).catch((error: Error) => {
            console.error("Error reading auth file: " + error);
            Utilities.insertText(containerV as MarkdownView, '# <div style="color: red; font-weight: bold;">WAIT!</div>No auth file found for ' + this.className + '.\nPlease create a file named ' + this.className + '-auth.md with the authorized users.');
            this.error = -1;
        });
    }

    authorized (data: string): boolean {
        console.log("Authorizing "+data+" for "+this.className);
        if (this.userTable.has(data)) {
            console.log("User "+data+" is authorized for "+this.className);
            return true;
        }
        return false;
    }

    async start() {

        console.log("Server class starting for "+this.className+".");

        this.classServer = net.createServer((socket: net.socket) => {
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
                        const IP = socket.remoteAddress.replace("::ffff:", "");
                        this.userTable.set(userName, IP);
                        if (IP === Utilities.getIPAddress()) {
                            this.userTable.set(userName, "::1");
                        }
                        new Notice("User " + userName + " has joined.");
                        Acknowledgement.send(socket, Acknowledgement.OK);
                    } else {
                        console.log("Not authorized to join from", socket.remoteAddress, "port", socket.remotePort);
                        Acknowledgement.send(socket, Acknowledgement.NOT_AUTHORIZED_TO_JOIN);
                        return;
                    }
                    
                } else if (command.getCommand() === Command.TEXT) {
                    console.log("Text from", socket.remoteAddress, "port", socket.remotePort);    

                    let userName = "";
                    let remoteAddress = socket.remoteAddress.contains(Utilities.getIPAddress()) ? Utilities.getIPAddress() : socket.remoteAddress;
                    remoteAddress = remoteAddress.replace("::ffff:", "");
                    console.log("Remote address: " + remoteAddress);

                    this.userTable.forEach((value, key) => {
                        console.log("Checking user: " + key + " with value: " + value);
                        if (remoteAddress == value ||
                            (remoteAddress === "::1" && Utilities.getIPAddress() == value)) {
                            console.log("Authorized to send text from", socket.remoteAddress, "port", socket.remotePort);
                            userName = key;
                            
                            console.log("User name found: " + userName);;  
                        }
                    });

                    if (userName === "") {
                        console.log("Not authorized to send text from", socket.remoteAddress);
                        Acknowledgement.send(socket, Acknowledgement.NOT_AUTHORIZED_FOR_TEXT);
                        return;
                    }

                    console.log("Text: "+data);
                    this.shaper.shapeThis(userName, data);
                    Acknowledgement.send(socket, Acknowledgement.OK);   

                } else if (command.getCommand() === Command.CHECK) {
                    console.log("Check from", socket.remoteAddress, "port", socket.remotePort);
                    Acknowledgement.send(socket, Acknowledgement.OK);

                } else if (command.getCommand() === Command.CONTENTS) {
                    console.log("Contents from", socket.remoteAddress, "port", socket.remotePort);
                    const contents = (this.containerView as MarkdownView).getViewData();
                    console.log("Contents: " + contents);
                    const buffer = Buffer.alloc(contents.length + 1);
                    buffer.write(contents);
                    socket.write(buffer);   

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

    dumpUserTable(): string {
        let dumpstring = "";
        for (const [key, value] of this.userTable.entries()) {
            dumpstring += key + ": " + value + "\n";
        }
        return dumpstring;
    }
    

}