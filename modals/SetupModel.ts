import {
	App,
	DropdownComponent,
	KeymapEventHandler,
	Modal,
	Setting,
	TFile,
	TextComponent,
	TextFileView,
	WorkspaceLeaf,
} from "obsidian";

export class SetupModel extends Modal {
	callbackOnClose(cn: string, sh: string)	: void;
	name: string;
	shaperName: string;
	fields: TextComponent[];
	possibleField: Setting;
	ec: boolean;
	enterhandler: KeymapEventHandler;
	field: number;

	shapers = [ "Colorify", "Box", "Word Cloud" ];

	constructor(app: App, callbackOnClose: (cname: string, sh: string) => void) {
		super(app);
		this.callbackOnClose = callbackOnClose;
		this.name = "";
		this.shaperName = "Colorify"; // Default shaper
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h2", { text: "Set Up the Server Note" });

		new Setting(contentEl).setName("Name of your class")
			.setDesc("for authentication purposes")
			.addText((text) =>
				text.setValue("").onChange((value) => {
					this.name = value;
				})
		);

		const shaperDropdown = 
			new Setting(contentEl).setName("Specify a response shaper").addDropdown( (component) => 
				component.setValue("Dropdown").onChange( (value) => {
					this.shaperName = value;
					console.log("Shaper selected: " + this.shaperName);
				})
			);
		
		for (const shaper of this.shapers) {
			(shaperDropdown.components[0] as DropdownComponent).addOption(shaper, shaper);
		}

		// new Setting(contentEl).setName("Do you want to include an AI bot?").addText((text) =>
		// 	text.setValue("").onChange((value) => {
		// 		this.name = value;
		// 	})
		// );

		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("OK")
				.setCta()
				.onClick(() => {
					this.close();
					this.callbackOnClose(this.name, this.shaperName);
				})
		);
	}

	onClose() {
		this.scope.unregister(this.enterhandler);
	}
}
