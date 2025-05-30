import { MarkdownView } from 'obsidian';
import os from 'os';

export default class Utilities {

    static async getIPAddress(): Promise<string> {

        const interfaces = os.networkInterfaces();

        for (const name of Object.keys(interfaces)) {
            for (const net of interfaces[name]) {
                if (net.family === 'IPv4' && !net.internal) {
                return net.address;
                }
            }
        }
        return "";
    }

    static insertText(view: MarkdownView, text: string) {
        if (view) {
            view.editor.replaceRange(text, view.editor.getCursor());
        } else {
            console.error("No active Markdown view found.");
        }
    }
}