# ewgn《企业微信群机器人实战》

> Dear，大家好，我是“前端小鑫同学”，😇长期从事前端开发，安卓开发，热衷技术，在编程路上越走越远～


---

### 背景介绍
我们公司一直在用企业微信来做员工的沟通工具，不少群里面都有添加一下群聊机器人来做一下任务的提醒，那么做为群聊机器人的一个应用场景自然就是执行定义任务，如定时发送会议提醒，周报填写提醒等等，那往往我们就需要有一台不关机的个人PC或者云服务器来支持群聊机器人的长时间运行（Windows系统中的广告可以在任务计划程序中找到并关闭），个人自用的PC电脑其实不太适合长时间的运行（Windows谁用谁知道，没多久就会变卡），云服务器也需要花费不少的费用，所以我们就需要有一个**Serverless**的平台来解决这个问题（免费的额度也够用了，绝对超值）。
### 案例介绍
我们通过采用腾讯云平台中**Serverless**产品下的**云函数**来做服务支撑完成一个企业微信群机器人定时每天早8点发送当天天气情况的一个案例，实现此案例你需要做如下准备工作：

1. 注册腾讯云平台：[https://cloud.tencent.com/](https://cloud.tencent.com/)
1. 注册企业微信平台：[https://work.weixin.qq.com/](https://work.weixin.qq.com/)
1. 使用VSCodeIDE并安装插件《Tencent Serverless Toolkit for VS Code》
### 企微群机器人如何发送消息：
实现企微群机器人消息发送主要是通过向分配给机器人的Webhook地址发送请求来完成的，如果你是群主当你拉机器人进群后查看机器人信息就可以得到机器人对应的Webhook地址了，特别特别要注意：一定要保护好机器人的webhook地址，避免泄漏！不要分享到github、博客等可被公开查阅的地方，否则坏人就可以用你的机器人来发垃圾消息了。。

- 企微群机器人配置说明：[https://work.weixin.qq.com/api/doc/90000/90136/91770](https://work.weixin.qq.com/api/doc/90000/90136/91770)

![image.png](https://cdn.nlark.com/yuque/0/2021/png/2373519/1640353287394-17076616-7a71-468f-bbc8-965bccea4af2.png#clientId=u732b3123-d254-4&from=paste&id=u1ce3988a&margin=%5Bobject%20Object%5D&name=image.png&originHeight=470&originWidth=383&originalType=binary&ratio=1&size=58948&status=done&style=none&taskId=u4b3ca5e9-8f33-4941-bd95-b7937ebceda)
#### 项目环境准备：

1. 初始化项目：`npm init -y`
1. 初始化Ts配置：`tsc --init`
1. 安装axios来实现请求数据：`yarn add axios`
#### 模块划分：

1. model.ts：消息模型（对应API文档），创建消息模型函数；
```typescript
/**
 * 消息类型
 */
export enum MsgType {
    /** markdown类型 */
    markdown = "markdown",
}

/**
 * markdow消息模型
 */
export type MarkdownContext = {
    /** markdown内容，最长不超过4096个字节，必须是utf8编码 */
    content: string,
}

/**
 * 消息模型基类
 */
export type Message<T> = {
    msgtype: MsgType & T,
    [type: string]: T,
}

/**
 * 创建待发送消息
 * @param type 
 * @param content 
 * @returns 
 */
function createMessage<T>(type: MsgType, content: T) {
    return {
        msgtype: type,
        [type]: content,
    } as Message<T>;
}

/**
 * 创建markdown类型的消息
 * @param content 
 * @returns 
 */
export function createFileMessage(content: FileContext) {
    return createMessage<FileContext>(MsgType.file, content);
}
```

2. notice.ts：发送各类型通知函数；
```typescript
import axios from 'axios';
import { createFileMessage, createImageMessage, createMarkdownMessage, createNewsMessage, createTextMessage, FileContext, ImageContext, MarkdownContext, Message, NewsContext, TextContext } from './model';

function request<T>(webhook: string, message: Message<T>) {
    if (!webhook) throw new Error("请设置正确机器人的webhook地址");
    axios.post(webhook, message).then(res => {
        const { status, data } = res;
        if (status === 200 && data) {
            console.log(data.errcode === 0 ? "发送成功" : data.errmsg);
        }
    }).catch(err => {
        console.log(err);
    })
}

/** 发起Markdown类型消息通知 */
export const requestMDNotice = (webhook: string, mdContext: MarkdownContext) => request<MarkdownContext>(webhook, createMarkdownMessage(mdContext));
```

3. index.ts：入口执行天气信息获取和调用发送Markdown类型消息。
```typescript
import { requestMDNotice } from "./notice";
import axios from 'axios';
import { AMAP_WEATHER_API, ENTERPRISE_WECHAT_ROBOT_WEB_HOOK } from "./config";
axios.get(AMAP_WEATHER_API).then(res => {
    const { status, data } = res;
    if (status === 200 && data) {
        if (data.status === '1' && data.infocode === '10000') {
            let message = ''
            data.lives.forEach((live: any) => {
                message += `
##### 今天${live.province}，${live.city}天气情况
* 天气： ${live.weather}
* 气温： ${live.temperature} 摄氏度
* 风向： ${live.winddirection}
* 风力： ${live.windpower} 级
* 湿度： ${live.humidity}
* 数据发布的时间： ${live.reporttime}\n
                `
            });
            // 向企业微信群发送MD格式的通知
            requestMDNotice(ENTERPRISE_WECHAT_ROBOT_WEB_HOOK, {
                content: message
            })
        }
    }
})
```

4. 高德天气查询API和机器人Webhook地址配置：
```typescript
// 企业微信群机器人webhook地址
export const  ENTERPRISE_WECHAT_ROBOT_WEB_HOOK = "《请填写你自己机器人的webhook地址》";
// 高德天气查询API,城市地址在高德开发文档查询
export const  AMAP_WEATHER_API = "《请填写你自己申请天气查询地址》"
```
#### 运行调试：

- 通过ts-node直接执行我们的入口文件：`ts-node .\src\index.ts`，输出发送成功后就可以在企微群看到最新的消息了。

![image.png](https://cdn.nlark.com/yuque/0/2021/png/2373519/1640354130557-c3ccb73b-ef7c-4be1-81c6-2a890a40b7e6.png#clientId=u732b3123-d254-4&from=paste&height=288&id=u1171dff1&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1154&originWidth=1125&originalType=binary&ratio=1&size=246749&status=done&style=none&taskId=u325dc52f-deae-42cd-9c2b-546998fa248&width=281)
### 云函数执行定时发送天气情况任务：
#### 安装并认识腾讯云函数开发插件《Tencent Serverless Toolkit for VS Code》：

- 拉取云端的云函数列表，并触发云函数。​
- 在本地快速创建云函数项目。
- 使用模拟的 COS、CMQ、CKafka、API 网关等触发器事件来触发函数运行。
- 上传函数代码到云端，更新函数配置。
- 在云端运行、调试函数代码。
#### 初始化并编写云函数：

1. 通过VSCode打开一个空的文件夹；
1. 认准腾讯云Logo![image.png](https://cdn.nlark.com/yuque/0/2021/png/2373519/1640354355560-1b5ac413-5ee5-4a32-8bf7-aeafc93c6fd6.png#clientId=u732b3123-d254-4&from=paste&height=34&id=u241bd680&margin=%5Bobject%20Object%5D&name=image.png&originHeight=34&originWidth=44&originalType=binary&ratio=1&size=772&status=done&style=none&taskId=u60db04c7-d07d-42fa-bc3f-e630f2c5e07&width=44)打开插件，第一次使用需要绑定用户凭证，绑定地域；
1. 在本地函数窗口创建函数=>选择Nodejs版本=>填写函数名，得到如下项目基础模板：

![image.png](https://cdn.nlark.com/yuque/0/2021/png/2373519/1640354664506-6301acdb-6881-4f02-b9b8-de7f2f68ea88.png#clientId=u732b3123-d254-4&from=paste&height=166&id=u7f470576&margin=%5Bobject%20Object%5D&name=image.png&originHeight=166&originWidth=216&originalType=binary&ratio=1&size=5948&status=done&style=none&taskId=u32005fca-dcc8-4eca-a786-e0736ac30ef&width=216)

4. 将我们ts编写的机器人发送通知的代码编译为js版本，直接运行`tsc`后将得到的内容覆盖云函数的`src`目录（index.js文件需要copy内容到main_handler函数中）；
4. 因为我们有实用`axios`模块来发送请求，所以云函数项目中也需要安装：进入云函数项目的`**src**`目录执行：`npm init -y && yarn add axios`；
#### 上传并在云端部署调试

- 云函数的开发到此就完成了，通过本地函数窗口执行上传云函数（node_module如果内容过多建议先在控制台进行安装），并在控制台执行部署和测试；

![image.png](https://cdn.nlark.com/yuque/0/2021/png/2373519/1640355408690-277d851b-906b-4380-aba4-7ec246f4bfee.png#clientId=u732b3123-d254-4&from=paste&height=432&id=u3b8bb59b&margin=%5Bobject%20Object%5D&name=image.png&originHeight=575&originWidth=1018&originalType=binary&ratio=1&size=46285&status=done&style=none&taskId=uff4c30b3-87e3-436a-86d6-c3c1d8004c0&width=764)
#### 配置触发管理（定时任务）

- 在触发管理菜单中创建新的触发器来执行定时任务Cron表达式通过[https://crontab.guru/every-day](https://crontab.guru/every-day)查询调整，提交后即可完成，期待明早的消息提醒吧。

![image.png](https://cdn.nlark.com/yuque/0/2021/png/2373519/1640355926812-7e3f760e-ee33-4bfd-83ca-fdf30ec69367.png#clientId=u732b3123-d254-4&from=paste&height=437&id=uWfEP&margin=%5Bobject%20Object%5D&name=image.png&originHeight=437&originWidth=685&originalType=binary&ratio=1&size=30319&status=done&style=none&taskId=u5e6b1864-50fc-4845-988d-61f77a6ca4e&width=685)![image.png](https://cdn.nlark.com/yuque/0/2021/png/2373519/1640355965746-b3ce5f13-c160-476a-b7f5-51201efd7f40.png#clientId=u732b3123-d254-4&from=paste&height=525&id=u19f51a57&margin=%5Bobject%20Object%5D&name=image.png&originHeight=525&originWidth=817&originalType=binary&ratio=1&size=31816&status=done&style=none&taskId=ude35c80e-682e-46cc-a38f-3d3e7644080&width=817)
### 结语：
本篇涉及到的内容点有：高德开发平台天气查询API使用，腾讯云Serverless云函数使用，企微群机器人配置及API，共同完成了今天的实战案例，你还有什么有趣的应用场景呢？说说看？😂

---

**欢迎关注我的公众号“前端小鑫同学”，原创技术文章第一时间推送。**
