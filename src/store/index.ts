// store 存放state reducer 中间件
import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'
import rootReducer from '../reducers'

// 增强 判断redux扩展中是否存在 不存在则使用redux自带的 compose
const composeEnhancers =
  typeof window === 'object' &&
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?   
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
    }) : compose

    // thunk完成异步操作
const middlewares = [
  thunkMiddleware
]

// 如果是开发环境 则在中间件中最后面添加redux-logger用来记录上一个状态 当前状态 和后面的一个状态
if (process.env.NODE_ENV === 'development') {
  middlewares.push(require('redux-logger').createLogger())
}

// 通过compose函数将中间件连着一起
const enhancer = composeEnhancers(
  applyMiddleware(...middlewares),
  // other store enhancers if any
)

// reducer 通过action和state参数 返回一个新的state 
// 将reducer 和 中间件 全部放在store中
export default function configStore () {
  const store = createStore(rootReducer, enhancer)
  return store
}
