import hljs from "highlight.js";
import {CodeBlockContent} from "./CodeBlockShape";

type CodeData = {
	className: string, // 類名稱
	funcs: CodeDataFunc[] // 函數名稱 與 代碼塊字串 集合
};

type CodeDataFunc = {
	language: string, // 程式語言
	name: string, // 函數名稱
	code: string,  // 代碼塊字串
	calls: CodeDataFuncCall[] // 調用的函數集合
};

type CodeDataFuncCall = {
	className: string, // 類名稱
	functionName: string // 函數名稱
};

export const CLASS_SHAPE_ID_TAG = "class-";
export const CODE_BLOCK_ID_TAG = 'code-block-';

class Utils {

	/**
	 * 計算字串寬度
	 */
	tCanvas: any = null;

	public getTextWidth(text: string, font: string) {
		// re-use canvas object for better performance
		const canvas = this.tCanvas || (this.tCanvas = document.createElement('canvas'));
		const context = canvas.getContext('2d');
		context.font = font + ' ui-sans-serif';
		return context.measureText(text).width;
	}

	/**
	 * 計算 HTML 代碼塊的高度
	 * @param codeText
	 */
	public getTextHeight(codeText: string) {

		// 創建一個新容器，將 HTML 代碼加入到容器中
		const node = document.createElement('div');
		node.innerHTML = '<pre style="padding-left: 20px">' + hljs.highlight(codeText, {language: 'java'}).value + '</pre>';
		document.body.appendChild(node);

		// 計算 容器高度
		const height: number = parseInt(global.getComputedStyle(node).height.split('px')[0]);

		// 移除容器
		document.body.removeChild(node);

		return height;
	}

	/**
	 * 根據 代碼塊字串 解析出 CodeData 對象
	 * @returns CodeData 對象
	 * @param codeBlockContent 代碼塊內容
	 */
	public parseCodeData(codeBlockContent: CodeBlockContent): CodeData {

		const lang = codeBlockContent.language;
		const content = codeBlockContent.code;

		// 類名、方法名 的 標示符
		const classTag = '@class';
		const functionTag = '@function';
		const callTag = '@call';

		const codeLines = content.split('\n');

		// 取得 註釋塊 的代碼
		const commentLines = [];
		for (let i = 0; i < codeLines.length; i++) {
			const codeLine = codeLines[i];

			// 找到註釋開頭，則從當前行開始，加入到註釋塊列表中
			if (codeLine.indexOf('/**') != -1) {
				commentLines.push(codeLine);
			} else if (commentLines.length > 0) {
				commentLines.push(codeLine);
			}

			// 當碰到第一個多行註釋的結尾，則跳出循環
			if (codeLine.indexOf('*/') != -1) {
				break;
			}
		}


		// 從 註釋塊 中獲取 類名、方法名、調用的函數集合
		let className = '';
		let functionName = '';
		const calls: CodeDataFuncCall[] = [];

		commentLines.forEach((comment) => {

			// 獲取 類名
			if (comment.indexOf(classTag) != -1) {
				className = comment.substring(comment.indexOf(classTag) + classTag.length).trim();
			}

			// 獲取 方法名
			if (comment.indexOf(functionTag) != -1) {
				functionName = comment.substring(comment.indexOf(functionTag) + functionTag.length).trim();
			}

			// 獲取 調用的函數
			if (comment.indexOf(callTag) != -1) {
				const callStr = comment.substring(comment.indexOf(callTag) + callTag.length).trim();
				calls.push({
					className: callStr.substring(0, callStr.indexOf('@')).trim(),
					functionName: callStr.substring(callStr.indexOf('@') + 1).trim()
				});
			}

		});

		// 封裝結果
		const result: CodeData = {
			className: className,
			funcs: [{
				language: lang,
				name: functionName,
				code: content,
				calls: calls
			}]
		};

		return result;
	}

	/**
	 * 獲取 類聲明 的 圖形Id
	 * @param className 類名
	 * @param functionName 方法名
	 * @param type Id 的類型
	 * @returns 圖形Id
	 */
	public getClassShapeId(className: string, functionName: string, type: 'class' | 'function'): string {
		if (type == 'class') {
			return CLASS_SHAPE_ID_TAG + className;
		} else if (type == 'function') {
			return CLASS_SHAPE_ID_TAG + className + '-' + functionName;
		}
		return '';
	}

	/**
	 * 獲取 代碼塊 的 圖形Id
	 * @param className 類名
	 * @param functionName 方法名
	 * @returns 圖形Id
	 */
	public getCodeBlockShapeId(className: string, functionName: string): string {
		return CODE_BLOCK_ID_TAG + className + '-' + functionName;
	}

	/**
	 * 將擁有相同 ClassName 的 CodeDataFunc 合併到一起
	 * @param codeDatas 要進行合併的 CodeData 集合
	 * @returns 合併後的 CodeData 集合
	 */
	public mergeCodeDatas(codeDatas: CodeData[]): CodeData[] {

		// 對有相同 className 的 CodeData 的 func 進行合併
		const classNameToCodeData = new Map();
		codeDatas.forEach((codeData: CodeData) => {

			// 如果在 Map 中已存在相應的 CodeData，則將 func 進行合併
			if (classNameToCodeData.has(codeData.className)) {
				const tempCodeData = classNameToCodeData.get(codeData.className) as CodeData;
				tempCodeData.funcs.push(codeData.funcs[0]);
			}
			// 如果在 Map 中還沒有相應的 CodeData，則將當前 CodeData 加入到 Map 中
			else {
				classNameToCodeData.set(codeData.className, codeData);
			}
		});

		// 封裝返回結果
		const result: CodeData[] = [];
		for (const codeData of Array.from(classNameToCodeData.values())) {
			result.push(codeData);
		}

		return result;
	}
}


export {Utils};
export type {CodeData, CodeDataFunc};

