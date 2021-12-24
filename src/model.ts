/**
 * 消息类型
 */
export enum MsgType {
    /** 文本类型 */
    text = "text",
    /** markdown类型 */
    markdown = "markdown",
    /** 图片类型 */
    image = "image",
    /** 图文类型 */
    news = "news",
    /** 文件类型 */
    file = "file",
}

/**
 * 文本消息模型
 */
export type TextContext = {
    /** 文本内容，最长不超过2048个字节，必须是utf8编码 */
    content: string,
    /** userid的列表，提醒群中的指定成员(@某个成员)，@all表示提醒所有人，如果开发者获取不到userid，可以使用mentioned_mobile_list */
    mentioned_list?: string[],
    /** 手机号列表，提醒手机号对应的群成员(@某个成员)，@all表示提醒所有人 */
    mentioned_mobile_list?: string[],
}

/**
 * markdow消息模型
 */
export type MarkdownContext = {
    /** markdown内容，最长不超过4096个字节，必须是utf8编码 */
    content: string,
}

/**
 * 图片消息模型
 */
export type ImageContext = {
    /** 图片内容的base64编码 */
    base64: string,
    /** 图片内容（base64编码前）的md5值 */
    md5: string,
}

/**
 * 图文消息对象
 */
export type Article = {
    /** 标题，不超过128个字节，超过会自动截断 */
    title: string,
    /** 描述，不超过512个字节，超过会自动截断 */
    description: string,
    /** 点击后跳转的链接。 */
    url: string,
    /** 图文消息的图片链接，支持JPG、PNG格式，较好的效果为大图 1068*455，小图150*150。 */
    picurl: string,
}

/**
 * 图文消息模型
 */
export type NewsContext = {
    /** 图文消息，一个图文消息支持1到8条图文 */
    articles: Article[],
}

/**
 * 文件类型消息模型
 */
export type FileContext = {
    /** 文件id，通过下文的文件上传接口获取 */
    media_id: string,
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

export function createTextMessage(content: TextContext) {
    return createMessage<TextContext>(MsgType.text, content);
}

export function createMarkdownMessage(content: MarkdownContext) {
    return createMessage<MarkdownContext>(MsgType.markdown, content);
}

export function createImageMessage(content: ImageContext) {
    return createMessage<ImageContext>(MsgType.image, content);
}

export function createNewsMessage(content: NewsContext) {
    return createMessage<NewsContext>(MsgType.news, content);
}

/**
 * 创建markdown类型的消息
 * @param content 
 * @returns 
 */
export function createFileMessage(content: FileContext) {
    return createMessage<FileContext>(MsgType.file, content);
}