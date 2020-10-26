// API请求
import Taro from '@tarojs/taro'
import { HTTP_STATUS } from '../constants/status'
import { baseUrl } from '../config'
import { logError } from '../utils/error'

export default {
  // 基础类型 默认请求类型 为 GET
  baseOptions(params, method = 'GET') {
    let { url, data } = params
    let contentType = 'application/json'
    contentType = params.contentType || contentType
    // 选择类型
    type OptionType = {
      url: string,
      data?: object | string,
      method?: any,
      header: object,
      // mode: string,
      success: any,
      error: any,
      xhrFields: object,
    }

    // 设置cookie
    // cookie的结果 cookies 名字 值 过期时间 路径 头部的Set-Cookie字段
    const setCookie = (res: {
      cookies: Array<{
        name: string,
        value: string,
        expires: string,
        path: string
      }>,
      header: {
        'Set-Cookie': string
      }
    }) => {
      if (res.cookies && res.cookies.length > 0) {
        let cookies = ''
        res.cookies.forEach((cookie, index) => {
          // windows的微信开发者工具返回的是cookie格式是有name和value的,在mac上是只是字符串的
          // 查看cookie是否存在
          if (cookie.name && cookie.value) {
            cookies += index === res.cookies.length - 1 ? `${cookie.name}=${cookie.value};expires=${cookie.expires};path=${cookie.path}` : `${cookie.name}=${cookie.value};`
          } else {
            cookies += `${cookie};`
          }
        });
        // 同步设置本地存储  字段 值
        Taro.setStorageSync('cookies', cookies)
      }
      // 头部字段 是否有 'Set-Cookie' 字段 有 则放入cookie中
      if (res.header && res.header['Set-Cookie']) {
        Taro.setStorageSync('cookies', res.header['Set-Cookie'])
      }
    }
    const option: OptionType = {
      // URL是否存在 前面是否有http  数据 请求方式 头部（内容类型 cookie）
      url: url.indexOf('http') !== -1 ? url : baseUrl + url,
      data: data,
      method: method,
      header: {
        'content-type': contentType,
        cookie: Taro.getStorageSync('cookies')
      },
      // mode: 'cors',
      // 而通过设置withCredentials 为true获得的第三方cookies，将会依旧享受同源策略，
      // 因此不能被通过document.cookie或者从头部相应请求的脚本等访问。
      xhrFields: { withCredentials: true },
      success(res) {
        // console.log('res', res)
        setCookie(res)
        // 请求成功表示有值回来 但是 有可能是返回的错误信息
        if (res.statusCode === HTTP_STATUS.NOT_FOUND) {
          return logError('api', '请求资源不存在')
        } else if (res.statusCode === HTTP_STATUS.BAD_GATEWAY) {
          return logError('api', '服务端出现了问题')
        } else if (res.statusCode === HTTP_STATUS.FORBIDDEN) {
          return logError('api', '没有权限访问')
        } else if (res.statusCode === HTTP_STATUS.AUTHENTICATE) {
          // 首先 清除本地缓存 然后跳转到登陆页面
          Taro.clearStorage()
          Taro.navigateTo({
            url: '/pages/login/index'
          })
          return logError('api', '请先登录')
        } else if (res.statusCode === HTTP_STATUS.SUCCESS) {
          return res.data
        }
      },
      error(e) {
        logError('api', '请求接口出现问题', e)
      }
    }
    // eslint-disable-next-line
    return Taro.request(option)
  },

  get(url, data?: object) {
    let option = { url, data }
    return this.baseOptions(option)
  },

  post: function (url, data?: object, contentType?: string) {
    let params = { url, data, contentType }
    return this.baseOptions(params, 'POST')
  },

  put(url, data?: object) {
    let option = { url, data }
    return this.baseOptions(option, 'PUT')
  },

  delete(url, data?: object) {
    let option = { url, data }
    return this.baseOptions(option, 'DELETE')
  }
}


