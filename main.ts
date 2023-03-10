import {Plugin, Workspace, WorkspaceLeaf} from 'obsidian';
import SourceCodeView from "./source-code";


export const SOURCE_CODE_VIEW_TYPE = 'source-code-view'
export default class MyPlugin extends Plugin {

	sourceCodeView: SourceCodeView
	codeBlocks: string[] = []

	async onload() {
		this.registerView(
			SOURCE_CODE_VIEW_TYPE,
			(leaf: WorkspaceLeaf) =>
				(this.sourceCodeView = new SourceCodeView(this.codeBlocks, leaf))
		);

		this.addRibbonIcon("dice", "Activate view", () => {
			this.initCanvas()
		});
	}

	initCanvas() {

		// 當 ResourceCodeView 頁面已開啟，則返回
		if (this.app.workspace.getLeavesOfType(SOURCE_CODE_VIEW_TYPE).length > 0) {
			return;
		}

		// 找不到激活的文件，則返回
		const activeFile = this.app.workspace.getActiveFile();
		if (activeFile == null) {
			return;
		}

		// 處理文件內容
		this.app.vault.process(activeFile, (data) => {

			// 清理數據
			this.codeBlocks = []

			// 獲取文件內所有的 Markdown 代碼塊
			const regex = /```(\w+)\s([\s\S]*?)```/gm;
			let match;
			while ((match = regex.exec(data)) !== null) {
				const lang = match[1]; // 程式語言
				const codeBlockData = match[2]; // 代碼塊內容
				this.codeBlocks.push(codeBlockData)
			}

			// 開啟分頁
			const preview = this.app.workspace.getLeaf('split', 'vertical')
			const mmPreview = new SourceCodeView(this.codeBlocks, preview);
			preview.open(mmPreview)

			// 不更改文件內容
			return data
		});

	}

	onunload() {

	}
}


