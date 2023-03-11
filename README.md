# Obsidian 源碼筆記插件

[技術支持 AntV X6](https://x6.antv.antgroup.com/)

## 一、插件功能

- 解析 Obsidian 筆記中的代碼區塊，繪製成方法調用鏈路的圖形，並在畫布中保留代碼區塊，方便查看
![Demo](img/demo.gif)

## 二、如何使用

### 1. 在 Markdown 的 代碼區塊 的 代碼註釋 部分，通過 關鍵字 編寫相關信息

目前暫時只支持 Java

| 支持的關鍵字 | 效果                          |
| ------------ |-----------------------------|
| @class       | 方法對應的類名稱                    |
| @function    | 方法名稱                        |
| @call        | 調用相關的方法，支持多個。格式: 類名稱 @ 方法名稱 |

**範例**

```Java
/** 
 * Register metadata string.
 * 
 * @class ShenyuClientHttpRegistryController
 * @function registerMetadata(@RequestBody final MetaDataRegisterDTO metaDataRegisterDTO)
 * @call RegisterClientServerDisruptorPublisher @ publish(final DataTypeParent data)
 * 
 * @param metaDataRegisterDTO the meta data register dto  
 * @return the string  
 */
@PostMapping("/register-metadata")  
@ResponseBody  
public String registerMetadata(@RequestBody final MetaDataRegisterDTO metaDataRegisterDTO) {  
    // 通过 Publisher 注册 元数据对象  
    publisher.publish(metaDataRegisterDTO);  
    return ShenyuResultMessage.SUCCESS;  
}
```

```Java
/** 
 * Register metadata string. 
 * 
 * @class RegisterClientServerDisruptorPublisher
 * @function publish(final DataTypeParent data)
 * 
 * @param metaDataRegisterDTO the meta data register dto  
 * @return the string  
 */
@Override  
public void publish(final DataTypeParent data) {  
    // 获取 DisruptorProvider 
    DisruptorProvider<Collection<DataTypeParent>> provider = providerManage.getProvider();  
    // 调用 DisruptorProvider 的 onData 方法，发送数据  
    provider.onData(Collections.singleton(data));  
}
```
