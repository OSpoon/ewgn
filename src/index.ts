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