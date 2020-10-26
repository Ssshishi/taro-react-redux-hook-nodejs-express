// 装饰器 完成后台运行
import Taro from '@tarojs/taro'

/**
 * 装饰器可以自己本身是个函数，或者可以是执行后是一个函数，这样可以传入需要的参数，如果本身是一个函数则使用的时候直接@injectPlaySong，如果想带参数则@injectPlaySong(params)
 * 该装饰器主要是为了解决在离开当前播放页到其他页面后可以继续播放的问题
 */
// ts 装饰器  
// 在TypeScript中装饰器还属于实验性语法，所以要想使用必须在配置文件中tsconfig.json编译选项中开启： "experimentalDecorators": true,
export function injectPlaySong() {
  // 如果无法确定类型,可以用as any 也可以完美解决.
  return function songDecorator(constructor) {
    return class PlaySong extends constructor {
      // 在接受父组件改变后的props需要重新渲染组件时用到的比较多
      // 接受一个参数nextProps
      // 通过对比nextProps和this.props，将nextProps的state为当前组件的state，从而重新渲染组件
      componentWillReceiveProps (nextProps) {
        // 比较两次歌名是否相同 不同则将新歌词赋予
        if (this.props.song.currentSongInfo.name !== nextProps.song.currentSongInfo.name) {
          this.setSongInfo(nextProps.song.currentSongInfo)
        }
        return super.componentWillReceiveProps && super.componentWillReceiveProps()
      }

      componentWillMount() {
        // 组件将加载 componentWillMount()一般用的比较少，它更多的是在服务端渲染时使用。
        // 它代表的过程是组件已经经历了constructor()初始化数据后，但是还未渲染DOM时。
        // 全局消息中心 取消监听
        Taro.eventCenter.off('nextSong')
        return super.componentWillMount && super.componentWillMount()
      }

      componentDidMount() {
        // 组件第一次渲染完成，此时dom节点已经生成，可以在这里调用ajax请求，返回数据setState后组件会重新渲染
        // 全局消息中心监听 下一首歌 事件 并绑定 props中的播放模式 确定是否进行播放
        console.log('test @injectPlaySong')
        Taro.eventCenter.on('nextSong', () => {
          const { playMode } = this.props.song
          this.playByMode(playMode)
        })
        return super.componentDidMount && super.componentDidMount()
      }
    
      // 设置歌词信息
      setSongInfo(songInfo) {
        // 采用try catch 方式 是因为尝试要完成的语句块 防止出现问题时没有处理方式
        try {
          // getBackgroundAudioManager 获取全局唯一的背景音频管理器
          const backgroundAudioManager = Taro.getBackgroundAudioManager()
          // 解构歌词信息的 名字 封面图片地址 地址
          const { name, al, url } = songInfo
          console.log('url', url)
          // if (!url) {
          //   this.getNextSong()
          //   return
          // }
          backgroundAudioManager.title = name
          backgroundAudioManager.coverImgUrl = al.picUrl
          backgroundAudioManager.src = url
        } catch(err) {
          // 遇见问题后 第一报错 第二获取下一首歌曲
          console.log('err', err)
          this.getNextSong()
        }
      }
      // 获取下一首
      getNextSong() {
        // 从props中获取 当前歌曲ID 能播放列表 播放模式
        const { currentSongIndex, canPlayList, playMode } = this.props.song
        let nextSongIndex = currentSongIndex + 1
        if (playMode === 'shuffle') {
          // shuffle 洗牌 随机模式
          this.getShuffleSong()
          return
        }
        if (playMode === 'one') {
          this.getCurrentSong()
          return
        }
        
        // 当前歌曲ID为播放列表最后一首
        if (currentSongIndex === canPlayList.length - 1) {
          nextSongIndex = 0
        }
        this.props.getSongInfo({
          id: canPlayList[nextSongIndex].id
        })
      }
    
      // 随机播放歌曲
      getShuffleSong() {
        const { canPlayList } = this.props.song
        let nextSongIndex = Math.floor(Math.random()*(canPlayList.length - 1))
        this.props.getSongInfo({
          id: canPlayList[nextSongIndex].id
        })
      }
    
      // 循环播放当前歌曲
      getCurrentSong() {
        const { currentSongInfo } = this.props.song
        this.setSongInfo(currentSongInfo)
      }
    
      // 根据播放模式进行播放
      playByMode(playMode: string) {
        switch (playMode) {
          case 'one':
            this.getCurrentSong()
            break
          case 'shuffle':
            this.getShuffleSong()
            break
          // 默认按列表顺序播放
          default:
            this.getNextSong()  
        }
      }

      componentWillUnmount() {
        // Taro.eventCenter.off('nextSong')
        return super.componentWillUnmount && super.componentWillUnmount()
      }
    }
  } as any
}