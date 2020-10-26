// 公共事件 比如 格式转换 歌词 时间 本地缓存获取歌词
/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-29 10:30:27
 * @LastEditTime: 2019-08-29 10:45:25
 * @LastEditors: Please set LastEditors
 */
import Taro from '@tarojs/taro'

// 从本地缓存中异步获取指定 key 的内容
Taro.getStorage({
  key: 'keywordsList'
})

// 数字格式
export const formatNumber = (n: number | string) : string => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 返回getFullYear()一个表示年份的 4 位数字
// getMonth() 从 Date 对象返回月份 (0 ~ 11)
// getDate() 从 Date 对象返回一个月中的某一天 (1 ~ 31)。
// getHours() 返回 Date 对象的小时 (0 ~ 23)。
// getMinutes() 返回 Date 对象的分钟 (0 ~ 59)。
// getSeconds() 返回 Date 对象的秒数 (0 ~ 59)。
export const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

// 转换歌词字符串为数组
export const parse_lrc = (lrc_content: string) => {
  // 声明一个临时数组 文字 时间 数值型
  let now_lrc: Array<{
    lrc_text: string,
    lrc_sec?: number
  }> = [];
  // 将文字按行转换成数组<字符串>形式
  let lrc_row: Array<string> = lrc_content.split("\n");
  let scroll = true; // 默认scroll初始值为true
  // indexOf 如果要检索的字符串值没有出现，则该方法返回 -1。
  // 对歌词数组遍历 每一行中 没有值或是为空 也需要加入歌词数组中
  for (let i in lrc_row) {
    if ((lrc_row[i].indexOf(']') === -1) && lrc_row[i]) {
      now_lrc.push({ lrc_text: lrc_row[i] })
      // 歌词数组不为空 则以 ] 进行分割
    } else if (lrc_row[i] !== '') {
      let tmp: string[] = lrc_row[i].split("]")
      // 对其进行遍历 截取数组字符串的1——8位 并以:分割
      for (let j in tmp) {
        scroll = false
        // substr() 方法可在字符串中抽取从 start 下标开始的指定数目的字符。
        let tmp2: string = tmp[j].substr(1, 8)
        let tmp3: any = tmp2.split(":")
        // 时间 分钟 秒钟
        let lrc_sec: any = Number(tmp3[0] * 60 + Number(tmp3[1]))
        // 当时间存在 且大于0时 此时加载歌词
        if (lrc_sec && (lrc_sec > 0)) {
          //   \s是指空白，包括空格、换行、tab缩进内等所有的空白
          // replace() 替换字符
          let lrc = (tmp[tmp.length - 1]).replace(/(^\s*)|(\s*$)/g, "")
          lrc && now_lrc.push({ lrc_sec: lrc_sec, lrc_text: lrc })
        }
      }
    }
  }
  // 当scroll为false 即不滚动时 依据时间对歌词进行排序 返回时间
  if (!scroll) {
    now_lrc.sort(function (a: {lrc_sec: number, lrc_text: string}, b: {lrc_sec: number, lrc_text: string}) : number {
      return a.lrc_sec - b.lrc_sec;
    });
  }
  // 返回歌词 和 滚动状态
  return {
    now_lrc: now_lrc,
    scroll: scroll
  };
}

// 存储搜索关键字
// 设置关键词进入本地历史中 
export const setKeywordInHistory = (keyword: string) => {
  // getStorageSync 从本地缓存中异步获取该key值的内容
  const keywordsList: Array<string> = Taro.getStorageSync('keywordsList') || []
  console.log('keywordsList', keywordsList)
  // findIndex() 方法返回传入一个符合条件的数组第一个元素位置。
  // 找出关键词所对应的index
  const index = keywordsList.findIndex((item) => item === keyword)
  // index存在 则splice() 方法用于添加或删除数组中的元素。注意：这种方法会改变原始数组。
  // 返回删除元素的数组
  if (index !== -1) {
    keywordsList.splice(index, 1)
  }
  //unshift()  将新项添加到数组起始位置
  keywordsList.unshift(keyword)
  // setStorage 将数据存储在本地缓存中指定的 key 中。会覆盖掉原来该 key 对应的内容
  Taro.setStorage({ key: 'keywordsList', data: keywordsList })
}

// 获取搜索关键字
export const getKeywordInHistory = () : Array<string> => {
  // 从本地缓存异步获取关键词列表
  return Taro.getStorageSync('keywordsList')
}

// 清除搜索关键字
export const clearKeywordInHistory = () => {
  // 从本地缓存中异步删除关键词列表
  Taro.removeStorageSync('keywordsList')
}

// 格式化播放次数 是指将次数以单位计量 比如 亿 万 千 百次 
export const formatCount = (times) => {
  let formatTime: any = 0
  times = times ? Number(times) : 0
  switch (true) {
    case times > 100000000 :
      formatTime = `${(times / 100000000).toFixed(1)}亿`
      break
    case times > 100000 :
        formatTime = `${(times / 10000).toFixed(1)}万`
        break
    default:
      formatTime = times
  }
  return formatTime
}

// 格式化时间戳为日期
export const formatTimeStampToTime = (timestamp) => {
  const date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  // 格式化年 月 日
  const year = date.getFullYear();
  const month = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1);
  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  // const hour = date.getHours() + ':';
  // const minutes = date.getMinutes() + ':';
  // const second = date.getSeconds();
  return `${year}-${month}-${day}`
}