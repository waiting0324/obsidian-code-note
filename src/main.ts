import {Plugin, WorkspaceLeaf} from 'obsidian';
import SourceCodeView from "./SourceCodeView";
import {CodeBlockContent} from "./CodeBlockShape";


export const SOURCE_CODE_VIEW_TYPE = 'source-code-view';
export default class SourceCodeViewPlugin extends Plugin {

	// Obsidian 中 Markdown 的 代碼塊內容 集合
	codeBlockContents: CodeBlockContent[] = [];

	/**
	 * 載入插件時，註冊相關組件
	 */
	async onload() {

		// 註冊 Obsidian 的 View
		this.registerView(
			SOURCE_CODE_VIEW_TYPE,
			(leaf: WorkspaceLeaf) => (new SourceCodeView(this.codeBlockContents, leaf))
		);

		// 註冊 Obsidian 左側的按鈕
		this.addRibbonIcon("file-json", "Show Resource Code View", () => {
			this.initView();
		});
	}

	/**
	 * 初始化 Obsidian 的 View 頁面
	 */
	initView() {

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
			this.codeBlockContents = [];

			// 獲取文件內所有的 Markdown 代碼塊
			const regex = /```(\w+)\s([\s\S]*?)```/gm;
			let match;
			while ((match = regex.exec(data)) !== null) {
				const lang = match[1]; // 程式語言
				const content = match[2]; // 代碼塊內容
				this.codeBlockContents.push({language: lang, code: content});
			}

			// 開啟分頁
			const preview = this.app.workspace.getLeaf('split', 'vertical');
			const mmPreview = new SourceCodeView(this.codeBlockContents, preview);
			preview.open(mmPreview);

			// 不更改文件內容
			return data;
		});

	}

	onunload() {
	}
}


