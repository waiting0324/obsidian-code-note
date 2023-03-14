import { Shape } from '@antv/x6';
import { CodeData, Utils } from './Utils';

const myUtils = new Utils();

class Edge {

    /**
     * 根據 CodeData 創建 函數名稱 到 代碼塊圖形 的 連線對象集合
     * @param codeData CodeData 對象
     * @returns 連線對象集合
     */
    public createFuncToCodeEdges(codeData: CodeData) {

        const result = [];

        // 遍歷所有的 函數對象，替每個 函數 與 代碼塊圖形 創建 連線對象
        for (const func of codeData.funcs) {

            // 創建 連線
            const edge = new Shape.Edge({
                source: {
                    cell: myUtils.getClassShapeId(codeData.className, '', 'class'),
                    port: myUtils.getClassShapeId(codeData.className, func.name, 'function'),
                    anchor: 'right'
                },
                target: {
                    cell: myUtils.getCodeBlockShapeId(codeData.className, func.name),
                    anchor: 'left'
                },
                router: {
                    name: 'er',
                    args: {
                        direction: 'L'
                    },
                },
                attrs: {
                    line: {
                        stroke: "#bdc3c7",
                        targetMarker: {
                            name: 'diamond',
                            width: 0,
                            height: 0,
                        },
                    },
                },
            });

            // 將 連線對象 加入到 返回結果 中
            result.push(edge);
        }

        return result;
    }

    /**
     * 根據 CodeData 創建 函數調用 連線對象 集合
     * @param CodeData 對象
     * @returns 連線對象 集合
     */
    public createFuncCallEdges(codeData: CodeData) {

        const result = [];

        // 遍歷 CodeData 中的每個 函數對象
        for (const func of codeData.funcs) {

            // 遍歷 函數對象 中的每個 調用函數
            for (const call of func.calls) {

                // 創建 連線對象
                const edge = new Shape.Edge({
                    source: {
                        cell: myUtils.getClassShapeId(codeData.className, '', 'class'),
                        port: myUtils.getClassShapeId(codeData.className, func.name, 'function'),
                        anchor: {
							name: "left",
							args: {
								dy: 8
							}
						}
                    },
                    target: {
                        cell: myUtils.getClassShapeId(call.className, '', 'class'),
                        port: myUtils.getClassShapeId(call.className, call.functionName, 'function'),
						anchor: {
							name: "left",
							args: {
								dy: -8
							}
						}
                    },
                    router: {
                        name: 'manhattan',
                        args: {
							startDirections: ["left"],
							endDirections: ["left"],
							padding: 30
                        },
                    },
                    attrs: {
                        line: {
                            stroke: "#2bb37b",
                        },
                    },
                });

                // 將 連線對象 加入到 返回結果 中
                result.push(edge);
            }
        }

        return result;
    }

}

export { Edge };
