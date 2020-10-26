// 返回新的state
import {
  GETDJLISTDETAIL
} from '../constants/dj'

import { djListType } from '../constants/commonType'

const INITIAL_STATE: djListType = {
  djListDetailInfo: {
    name: ''
  },
}
// 通过state 和 action 参数 返回新的state
export default function dj (state = INITIAL_STATE, action) {
  switch (action.type) {
    // 获取电台节目列表详情
    // 根据action类型 找到action 事件 
    // 返回新的state
    case GETDJLISTDETAIL:
      const { djListDetailInfo } = action.payload
      return {
        // ...state 是为了在改变电台节目列表详情state情况下 不改变其他state信息
        ...state,
        djListDetailInfo: djListDetailInfo
      }
    default:
      return state
  }
}
