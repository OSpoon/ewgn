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

/** 发起文本类型消息通知 */
export const requestTextNotice = (webhook: string, textContext: TextContext) => request<TextContext>(webhook, createTextMessage(textContext));
/** 发起文件类型消息通知 */
export const requestFileNotice = (webhook: string, fileContext: FileContext) => request<FileContext>(webhook, createFileMessage(fileContext));
/** 发起图片类型消息通知 */
export const requestImageNotice = (webhook: string, imageContext: ImageContext) => request<ImageContext>(webhook, createImageMessage(imageContext));
/** 发起图文类型消息通知 */
export const requestNewsNotice = (webhook: string, newsMessage: NewsContext) => request<NewsContext>(webhook, createNewsMessage(newsMessage));
/** 发起Markdown类型消息通知 */
export const requestMDNotice = (webhook: string, mdContext: MarkdownContext) => request<MarkdownContext>(webhook, createMarkdownMessage(mdContext));