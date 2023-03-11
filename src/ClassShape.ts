import {Graph} from '@antv/x6';
import {Utils} from './Utils'

const myUtils = new Utils()

/**
 * 註冊 類聲明 中 方法名稱位置 計算函數
 */
Graph.registerPortLayout(
	'classFuncPosition',
	(portsPositionArgs, elemBBox) => {
		return portsPositionArgs.map((_, index) => {
			return {
				position: {
					x: 0,
					y: (index + 1) * elemBBox.height,
				},
				angle: 0,
			}
		})
	},
	//true,
)

/**
 * 類聲明 圖形定義
 */
Graph.registerNode(
	'clazz-shape',
	{
		// 最上層 class 名稱
		inherit: 'rect',
		markup: [
			{
				tagName: 'rect',
				selector: 'body',
			},
			{
				tagName: 'text',
				selector: 'label',
			},
		],
		attrs: {
			rect: {
				strokeWidth: 1,
				stroke: '#e5885c',
				fill: '#fd9a6c',
			},
			label: {
				fontWeight: 'bold',
				fill: '#ffffff',
				fontSize: 14,
				textAnchor: 'middle',
				textVerticalAnchor: 'middle'
			},
		},
		// 該 class 所屬的方法列表
		ports: {
			groups: {
				list: {
					position: 'classFuncPosition',
					markup: [
						{
							tagName: 'rect',
							selector: 'func',
						},
						{
							tagName: 'text',
							selector: 'funcName',
						},
						{
							tagName: 'circle',
							selector: 'funcInCircle'
						},
						{
							tagName: 'circle',
							selector: 'funcOutCircle'
						},
						{
							tagName: 'circle',
							selector: 'toggle'
						},
						{
							tagName: 'text',
							selector: 'toggleText'
						}
					],
					attrs: {
						func: {
							strokeWidth: 1,
							stroke: '#e5885c',
							fill: '#FFFFFF',
						},
						funcName: {
							fontSize: 13,
							textAnchor: 'middle',
							textVerticalAnchor: 'middle'
						},
						funcInCircle: {
							r: 5,
							stroke: '#efab7c',
							strokeWidth: 1,
							fill: '#fff'
						},
						funcOutCircle: {
							r: 5,
							stroke: '#efab7c',
							strokeWidth: 1,
							fill: '#fff'
						},
						toggle: {
							r: 7,
							stroke: '#b2bec3',
							strokeWidth: 2,
							fill: '#fff',
							cursor: 'pointer',
						},
						toggleText: {
							fontSize: 12,
							fontWeight: 800,
							fill: '#b2bec3',
							textAnchor: 'middle',
							textVerticalAnchor: 'middle',
							'pointer-events': 'none', // 避免按鈕不靈敏
							cursor: 'pointer',
						}
					},
				},
			},
		},
	},
	true,
)

class ClassShape {

	/**
	 * 根據 類名、方法名稱集合 創建 類聲明圖形
	 * @param className 類名
	 * @param funcNames 方法名稱集合
	 * @returns 類聲明圖形
	 */
	public createClassShape(className: string, funcNames: string[]) {

		const height = 30

		// 計算 類聲明 圖形寬度
		let maxWidth = 100
		maxWidth = Math.max(maxWidth, myUtils.getTextWidth(className, "14px bold") + 60)
		funcNames.forEach((funcName: string) => {
			maxWidth = Math.max(maxWidth, myUtils.getTextWidth(funcName, "13px") + 20)
		})

		// 定義頂部類名稱方塊
		let classShape = {
			"id": myUtils.getClassShapeId(className, '', 'class'),
			"shape": 'clazz-shape',
			"label": className,
			"width": maxWidth,
			"height": height,
			"fontSize": 14,
			"position": {
				"x": 100,
				"y": 100
			},
			"ports": [{}]
		}
		classShape.ports = []


		// 定義下方函數名稱方塊
		funcNames.forEach((funcName: string) => {

			// 代碼塊 連接桩
			let port = {
				"id": myUtils.getClassShapeId(className, funcName, 'function'),
				"group": "list",
				"attrs": {
					"func": {
						width: maxWidth,
						height: height + 10,
					},
					"funcName": {
						ref: 'func',
						refX: '50%',
						refY: '50%',
						text: funcName,
					},
					"funcInCircle": {
						ref: 'func',
						refX: 0,
						refY: 0.3,
					},
					"funcOutCircle": {
						ref: 'func',
						refX: 0,
						refY: 0.7,
					},
					"toggle": {
						ref: 'func',
						refDx: 0,
						refY: 0.5,
						event: 'toggle:codeBlock',
						targetCodeBlock: myUtils.getCodeBlockShapeId(className, funcName),
					},
					"toggleText": {
						ref: 'toggle',
						refX: 0.5,
						refY: 0.5,
						text: '+',
						event: 'toggle:codeBlock',
						targetCodeBlock: myUtils.getCodeBlockShapeId(className, funcName),
					}
				}
			}
			classShape.ports.push(port)
		})

		return classShape
	}
}

export {ClassShape}
