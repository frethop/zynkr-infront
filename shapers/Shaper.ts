import { View } from 'obsidian';

export class Shaper {

    containerView: View;
    
    constructor(containerV: View) {
        this.containerView = containerV;
        console.log("Shaper class starting.");
    }

    shapeThis(userName: string, data: string) {
        console.log("Shaping data: "+data+" for "+userName);

    }
}