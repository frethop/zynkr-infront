import { Editor, MarkdownView, View } from "obsidian";

import { Shaper } from "./Shaper";

export class Box extends Shaper {

    colorTable: Map<string, string>;
    userTable: Map<string, string>;
    table: HTMLTableElement;
    tableRows: number;
    tRow: number;
    tableCols: number;
    tCol: number;
    editor: Editor;

    constructor(containerV: View) {
        super(containerV);

        console.log("Box class starting for "+containerV+".");

        this.colorTable = new Map<string, string>();
        this.userTable = new Map<string, string>();

        this.table = containerV.containerEl.createEl("table", { cls: "view-style" });
        this.tableCols = 4;
        this.tRow = 0;
        this.tCol = 0;

        this.editor = (containerV as MarkdownView).editor;
    }

    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        
        return color;
    }

    shapeThis(userName: string, data: string) {
        console.log("Boxing data: "+data+" for "+userName);

        var tdata = this.userTable.get(userName);
        if (tdata === undefined) {
            tdata = ""+this.tRow+"-"+this.tCol;
            this.userTable.set(userName, tdata);
            this.tCol += 1;
            if (this.tCol >= this.tableCols) {
                this.tCol = 0;
                this.tRow += 1;
            }
        }
        
        // Rewrite the user table
        let html = "<table>";
        for (let i = 0; i <= this.tRow; i++) {
            html += "<tr>";
            for (let j = 0; j < this.tableCols; j++) {
                for (const [user, position] of this.userTable.entries()) {
                    if (position === i+"-"+j) {
                        const color = this.colorTable.get(user) || this.getRandomColor();
                        this.colorTable.set(user, color);
                        html += `<td style="background-color: ${color};">${user}\n${data}</td>`;
                    }           
                }
            }
        }
        html += "</tr></table>";

        this.editor.replaceRange(html, { line: 0, ch: 0 }, this.editor.getCursor());
        this.editor.setCursor(this.editor.getCursor().line + 1, 0);
        this.editor.replaceRange("\n", this.editor.getCursor());

        console.log("Data shaped: "+data+" for "+userName);
     }
}