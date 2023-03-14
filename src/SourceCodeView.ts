import {ItemView, WorkspaceLeaf} from "obsidian";
import {initGraph} from "./Graph";
import {SOURCE_CODE_VIEW_TYPE} from "./main";
import {CodeBlockContent} from "./CodeBlockShape";

export default class SourceCodeView extends ItemView {

	// 代碼塊內容 集合
	codeBlocks: CodeBlockContent[]

	constructor(codeBlocks: CodeBlockContent[], leaf: WorkspaceLeaf) {
		super(leaf);
		this.codeBlocks = codeBlocks;
	}

	getDisplayText(): string {
		return "Source Code View";
	}

	getViewType(): string {
		return SOURCE_CODE_VIEW_TYPE;
	}

	async onOpen() {

		// 清空 容器內容
		const container = this.containerEl.children[1];
		container.empty();

		// 創建 AntV 需要的容器
		const div = document.createElement("div")
		div.id = 'container';
		container.appendChild(div);

		// 初始化 AntV 的 畫布
		initGraph(this.codeBlocks);
	}

	async onClose() {
	}

}
