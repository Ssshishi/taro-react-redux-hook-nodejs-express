// action事件

// 从constant 里面 导入 获取电台详情 action类型
// 同时 请求 电台详情 数据
import {
  GETDJLISTDETAIL
} from '../constants/dj'
import api from '../services/api'


// 获取电台节目列表详情
export const getDjListDetail = (payload) => {
  const { id } = payload
  // dispatch 异步action 
  // 当获取到dj详情后 异步发送action事件
  return dispatch => {
    api.get('/dj/program/detail', {
      id: id
    }).then((res) => {
      dispatch({
        type: GETDJLISTDETAIL,
        payload: {
          djListDetailInfo: res.data.ids || []
        }
      })
    })
  }
}



