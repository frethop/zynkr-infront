import { Editor, MarkdownView, View } from "obsidian";

import { Shaper } from "./Shaper";

export class Colorify extends Shaper {

    colorTable: Map<string, string>;
    div: HTMLDivElement;
    editor: Editor;

    constructor(containerV: View) {
        super(containerV);

        console.log("Colorify class starting for "+containerV+".");

        this.colorTable = new Map<string, string>();

        this.div = containerV.containerEl.createEl("div", { cls: "view-style" });
        this.div.innerHTML += "<hr/>";

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
        console.log("Coloring data: "+data+" for "+userName);

        let color = "";
        if (this.colorTable.has(userName)) {
            const c = this.colorTable.get(userName);
            color = c ? c : "#000000";
            console.log("Color for "+userName+" is "+color);
        } else {
            color = this.getRandomColor();
            this.colorTable.set(userName, color);
            console.log("New color for "+userName+" is "+color);
        } 
        
        let txt = this.div.innerHTML
        //console.log("Current text: "+txt);
        txt += `<span style="color: ${color}; font-size: 20px; font-weight: bold;">${data}</span><br/>`;
        //console.log("New text: "+txt);
        //this.div.innerHTML = txt;

        this.editor.replaceRange(data, this.editor.getCursor());

        console.log("Data shaped: "+data+" for "+userName);
     }
}