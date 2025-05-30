// Stolen from https://github.com/helloitsian/custom-modals-obsidian/blob/main/src/modal/CustomModal.ts

import { App, Modal, Notice, Plugin, Setting } from 'obsidian';

export class Alert extends Modal {
	plugin: Plugin;
	title: string;
	content: string;
	okText: string;
	cancelText: string;
	continueCallback: () => void;
  
	constructor(
		plugin: Plugin,
		title: string,
		content: string,
	) {
		super(plugin.app);

		this.plugin = plugin;
		this.title = title;
		this.content = content;
	}

	async onOpen() {
		new Notice(this.content);

		let {contentEl} = this;
		
		contentEl.createEl("form", {}, (form) => {

			let titleDiv = form.createDiv();
			titleDiv.createEl("h2", { text: this.title });
			titleDiv.createEl("hr");
			
			titleDiv.createEl("h4", { text: this.content});

			form.createDiv("alert-button-container", container => {
				container
					.createEl("button", { attr: { type: "button" }, text: "Ok" })
					.addEventListener("click", () => {
						this.close();
					});

			});

		});
	}

	onClose() {
		let {contentEl} = this;
		contentEl.empty();
	}


}

