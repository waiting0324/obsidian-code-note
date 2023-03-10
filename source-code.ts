import {ItemView, View, WorkspaceLeaf} from "obsidian";
import {indexInit} from "./index";
import {SOURCE_CODE_VIEW_TYPE} from "./main";

export default class SourceCodeView extends ItemView {

	codeBlocks: string[]

	constructor(codeBlocks: string[], leaf: WorkspaceLeaf) {
		super(leaf);
		this.codeBlocks = codeBlocks;
	}

	getDisplayText(): string {
		return "MySourceCodeView";
	}

	getViewType(): string {
		return SOURCE_CODE_VIEW_TYPE;
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		const div = document.createElement("div")
		div.id = 'container';
		this.containerEl.children[1].appendChild(div);

		indexInit(this.codeBlocks);
	}

	async onClose() {
	}

}
