import {Cell, Graph, Shape} from '@antv/x6';
import {CodeBlockShape} from './codeBlockShape';
import {ClassShape} from './classShape';
import {CLASS_SHAPE_ID_TAG, CODE_BLOCK_ID_TAG, CodeData, utils} from './utils';
import {Edge} from './edge'

let codeBlocks = [`
    /**
     * listen plugin handler event and handle plugin.
     * @class ShenyuWebHandler
     * @function onApplicationEvent(final PluginHandlerEvent event)
     * @param event sort plugin event
     */
    @Override
    public void onApplicationEvent(final PluginHandlerEvent event) {
        PluginHandlerEventEnum stateEnums = event.getPluginStateEnums();
        PluginData pluginData = (PluginData) event.getSource();
        switch (stateEnums) {
            case ENABLED:
                onPluginEnabled(pluginData);
                break;
            case DELETE:
            case DISABLED:
                // disable or removed plugin.
                onPluginRemoved(pluginData);
                break;
            case SORTED:
                // copy a new one, or there will be concurrency problems
                onSortedPlugins();
                break;
            default:
                throw new IllegalStateException("Unexpected value: " + event.getPluginStateEnums());
        }
        onSortedPlugins();
    }
    `,
    `
    /**
     * handler error.
     *
     * @class ShenyuWebHandler
     * @function handle(@NonNull final ServerWebExchange exchange, @NonNull final Throwable throwable)
     * @call ShenyuPluginLoader @ getInstance()
     * 
     * @param exchange  the exchange
     * @param throwable the throwable
     * @return error result
     */
    @Override
    @NonNull
    public Mono<Void> handle(@NonNull final ServerWebExchange exchange, @NonNull final Throwable throwable) {
        LOG.error("handle error: {}{}", exchange.getLogPrefix(), formatError(throwable, exchange.getRequest()), throwable);
        HttpStatus httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        if (throwable instanceof ResponseStatusException) {
            httpStatus = ((ResponseStatusException) throwable).getStatus();
        }
        exchange.getResponse().setStatusCode(httpStatus);
        Object error = ShenyuResultWrap.error(exchange, httpStatus.value(), httpStatus.getReasonPhrase(), throwable);
        return WebFluxResultUtils.result(exchange, error);
    }
    `,
    `
    /**
     * Get plugin loader instance.
     * 
     * @class ShenyuPluginLoader 
     * @function getInstance()
     * 
     * @return plugin loader instance
     */
    public static ShenyuPluginLoader getInstance() {
        if (null == pluginLoader) {
            synchronized (ShenyuPluginLoader.class) {
                if (null == pluginLoader) {
                    pluginLoader = new ShenyuPluginLoader();
                }
            }
        }
        return pluginLoader;
    }
    `]

const myUtils = new utils()
const codeBlockShape = new CodeBlockShape()
const classShape = new ClassShape()
const edge = new Edge()

// window.onload = function () {
export let indexInit = function (codeBlocks: String[]) {

    // 創建畫布
    const graph = new Graph({
        container: <HTMLElement>document.getElementById('container'),
        width: 2200,
        height: 1200,
        background: {
            color: '#fffbe6', // 设置画布背景颜色
        },
        grid: {
            size: 10,      // 网格大小 10px
            visible: true, // 渲染网格背景
        },
    });

    // 將 代碼塊字串 集合 解析成 CodeData 對象集合，並將相同 className 的對象進行合併
    let codeDatas: CodeData[] = []
    codeBlocks.forEach((codeBlock: string) => {
        let codeData: CodeData = myUtils.parseCodeData(codeBlock)
        codeDatas.push(codeData)
    })
    codeDatas = myUtils.mergeCodeDatas(codeDatas)


    // 將 CodeData 對象列表 繪製成 類圖形、代碼塊圖形
    for (const codeData of codeDatas) {

        // 將 類圖形、代碼塊圖形 加入到 畫布 中
        let funcNames = codeData.funcs.map(item => item.name)
        graph.addNode(classShape.createClassShape(codeData.className, funcNames))
        graph.addNodes(codeBlockShape.createCodeBlockShape(codeData))

        // 創建 函數名稱 與 代碼塊圖形 的 連線
        graph.addEdges(edge.createFuncToCodeEdges(codeData))

    }

    // 繪製 CodeData 中的 函數調用 連線
    for (const codeData of codeDatas) {
        graph.addEdges(edge.createFuncCallEdges(codeData))
    }

    // 綁定 開啟/關閉 代碼塊圖形 事件
    graph.on('toggle:codeBlock', ({e, node}) => {

		console.dir(e)
		console.dir(node)

        // 獲取 代碼塊圖形、開關文字 對象
        let codeBlock = graph.getCellById(e.currentTarget.getAttribute('target-code-block'))
        let toggleText = e.currentTarget.parentNode.childNodes[3].children[0]

        // 如果當前 代碼塊圖形 正在顯示，則關閉。反之則開啟
        if (codeBlock.getProp().visible) {
            codeBlock.hide()
            toggleText.textContent = '+'
            toggleText.setAttribute('dy', '0.3em')
        } else {

            // 計算 代碼塊 顯示位置
            const intervalX = 200
            const posX = e.offsetX + intervalX
            const posY = e.offsetY - (codeBlock.getProp().size.height / 2)
            codeBlock.prop("position", {x: posX, y: posY})

            codeBlock.show()
            toggleText.textContent = '-'
            toggleText.setAttribute('dy', '0.2em')
        }
    })

    // 最大的 類圖形 的寬度
    let maxClassShapeWidth = 0;
    // 所有的 類圖形 集合
    let classShapes: Cell[] = [];

    // 遍歷 所有的圖形
    for (const node of graph.getCells()) {

        // 默認隱藏所有的 代碼塊
        if (node.id.startsWith(CODE_BLOCK_ID_TAG)) {
            node.hide()
        }

        // 計算 類圖形 最大寬度、加入到集合中
        if (node.id.startsWith(CLASS_SHAPE_ID_TAG)) {
            maxClassShapeWidth = Math.max(maxClassShapeWidth, node.getProp().size.width)
            classShapes.push(node)
        }
    }

    /**
     * 計算 類圖形 的 座標
     */
    // 左側保留寬度
    const marginLeftWidth = 100
    // 類圖形的 Y 座標
    let curY = 200
    // 多個 類圖形 的 上下間格
    const intervalY = 150
    // 所有 類圖形 的 中線 X 座標
    const midX = marginLeftWidth + (maxClassShapeWidth / 2)
    for (const classShape of classShapes) {

        // 計算 類圖形 的 左上X 座標，並設置
        const posX = midX - (classShape.getProp().size.width / 2)
        classShape.prop("position", {x: posX, y: curY})

        // 下個 類圖形 的 Y 座標 = 當前 類圖形 高度 + 間隔
        curY = curY + classShape.getProp().size.height + intervalY
    }

}


