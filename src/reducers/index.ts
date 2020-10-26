// combineReducers()做的就是产生一个整体的 Reducer 函数。
// 该函数根据 State 的 key 去执行相应的子 Reducer，并将返回结果合并成一个大的 State 对象。
import { combineReducers } from 'redux'
import song from './song'
import dj from './dj'

export default combineReducers({
  song,
  dj
})
