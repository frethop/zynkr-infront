import { App, Editor, MarkdownView, Menu, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

import { Alert } from "modals/alert";
import { Server } from "Server";
import { SetupModel } from "modals/SetupModel";
import Utilities from "Utilities";

// Remember to rename these classes and interfaces!

interface ClassroomServerSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: ClassroomServerSettings = {
	mySetting: 'default'
}

const version = "Classroom Server version 0.0.1 (05292025)";
let classServer: Server;



export default class ClassroomServer extends Plugin {
	settings: ClassroomServerSettings;
	keystring: string;

	async onload() {
		await this.loadSettings();

		console.log(version + " loaded.");

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('file-cog', 'Classroom Server Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new SetupModel(this.app,  () => {
				const view = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (view) {
				//this.app.workspace.containerEl.children[2].empty();
					this.registerEvent(
        				this.app.workspace.on('editor-menu', (menu, editor, info) => {
        					menu.addItem((item) => {
          						item.setTitle('My Custom Action')
              						.setIcon('dice') // Choose any icon from Lucide
              						.onClick(() => {
                						new Notice("CLICK!");
              						});
								});
						})	
					);

					//const el = this.app.workspace.containerEl.children[2] as HTMLElement; 

					//(new Alert(this.app, "IP Address", "Start your client document by connecting to "+Utilities.getIPAddress())).open();

					classServer = new Server("CSCI 112", "colorify", view);
					classServer.start();
				} else {
					new Notice('No active Markdown view found.');
				}

		}).open();
	
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-classroom-server-class');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		this.keystring = "";
		//this.registerDomEvent(window, 'keydown', this.handleKeys);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000))

		this.registerEvent(
      		this.app.workspace.on('file-menu', (menu, file) => {
        		menu.addItem((item) => {
          		item.setTitle('My Custom Action')
              		.setIcon('dice') // Choose any icon from Lucide
              		.onClick(() => {
                		new Notice(`You clicked on: ${file.name}`);
              		});
        });
      })
    );
			
	}

	async handleKeys(kbe: KeyboardEvent) {
		console.log("Key pressed: " + kbe.key);
		if (classServer != undefined) {
			if (kbe.code == "Enter") {
				classServer.handleMyKeys(keystring);
				this.keystring = "";
			} else if (kbe.code != "ShiftLeft" && kbe.code != "ShiftRight" && kbe.code != "Backspace" && kbe.code != "CapsLock") {
				this.keystring += kbe.key;
			}
		}
	}
	
	onunload() {
		classServer.stop();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}



class SampleSettingTab extends PluginSettingTab {
	plugin: ClassroomServer;

	constructor(app: App, plugin: ClassroomServer) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
