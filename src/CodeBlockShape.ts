import hljs from 'highlight.js';
import {CodeData, Utils} from './Utils'

const myUtils = new Utils()

type CodeBlockContent = {
	language: string, // 程式語言
	code: string // 具體代碼
}

class CodeBlockShape {

	/**
	 * 根據 CodeData 對象 獲取 AntV 的 HTML 對象集合
	 * @param codeData CodeData 對象
	 * @returns HTML 對象集合
	 */
	public createCodeBlockShape(codeData: CodeData) {

		// 結果對象集合
		let result = []

		// 將 CodeData 中的每個 func 的 code 轉換成 AntV 的 HTML 對象
		let codeDataFuncs = codeData.funcs
		for (const codeDataFunc of codeDataFuncs) {

			// 獲取 代碼塊字串，並分割成行
			let codeText = codeDataFunc.code
			let codeTextLines = codeText.split('\n')

			// 獲取 代碼塊所需高度
			let blockHeight = myUtils.getTextHeight(codeDataFunc.code) + 30;

			// 計算代碼塊所需寬度
			let blockWidth = 0
			for (let i = 0; i < codeTextLines.length; i++) {
				blockWidth = Math.max(blockWidth, myUtils.getTextWidth(codeTextLines[i], "13px") + 60)
			}

			// 構建 HTML 對象
			const htmlShape = {
				id: myUtils.getCodeBlockShapeId(codeData.className, codeDataFunc.name),
				x: 800,
				y: 100,
				width: blockWidth,
				height: blockHeight,
				shape: 'html',
				attrs: {
					body: {
						fill: 'white',
						stroke: '#666',
					}
				},
				html() {
					const wrap = document.createElement('div')
					wrap.innerHTML = '<pre style="padding-left: 20px">' + hljs.highlight(codeText, {language: codeDataFunc.language}).value + '</pre>'
					return wrap
				},
			}

			// 將 HTML 對象加入到返回結果中
			result.push(htmlShape)
		}

		return result;
	}

}

export {CodeBlockShape};
export type {CodeBlockContent};

