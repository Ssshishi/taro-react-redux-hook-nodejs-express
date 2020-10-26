// 错误
import { formatTime } from './common'
// 下面这种写法 是用来 备注变量类型 作用
/**
 *
 * @param {string} name 错误名字
 * @param {string} action 错误动作描述
 * @param {string} info 错误信息，通常是 fail 返回的
 */
// eslint-disable-next-line
// 不在参数类型后加载返回类型 表示 不返回 void
export const logError = (name: string, action: string, info?: string | object ) => {
  if (!info) {
    info = 'empty'
  }
  let time = formatTime(new Date())
  console.error(time, name, action, info)
  if (typeof info === 'object') {
    info = JSON.stringify(info)
  }
}

