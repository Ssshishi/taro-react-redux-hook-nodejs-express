// 视频详情
import Taro, { useState, useEffect, useRouter, FC } from '@tarojs/taro'
import { View, Video, Text, Image, ScrollView } from '@tarojs/components'
import classnames from 'classnames'
import { AtIcon } from 'taro-ui'
import { formatCount, formatNumber, formatTimeStampToTime } from '../../utils/common'
import CWhiteSpace from '../../components/CWhiteSpace'
import CLoading from '../../components/CLoading'
import api from '../../services/api'
import './index.scss'

type videoInfo = {
    coverUrl: string,
    title: string,
    shareCount: number,
    playTime: number,
    praisedCount: number,
    commentCount: number,
    subscribeCount: number,
    creator: {
      nickname: string,
      avatarUrl: string
    },
    videoGroup: Array<{
      id: number,
      name: string
    }>
  }
  // mv信息
type mvInfo = {
    cover: string,
    name: string,
    briefDesc: string,
    desc: string,
    shareCount: number,
    playCount: number,
    likeCount: number,
    commentCount: number,
    subCount: number,
    artists: Array<{
      name: string,
      id: number
    }>,
    avatarUrl: string,
    publishTime: string
  }
  // videoUrl: string,
  type relatedList = Array<{
    vid: string,
    title: string,
    durationms: number,
    playTime: number,
    coverUrl: string,
    creator: Array<{
      userName: string
    }>
  }>
  type mvRelatedList = Array<{
    id: string,
    name: string,
    duration: number,
    playCount: number,
    cover: string,
    artistName: string
  }>
  // type: any,
  // showMoreInfo: boolean,
  type commentInfo = {
    commentList: Array<{
      content: string,
      commentId: number,
      time: number,
      likedCount: number,
      liked: boolean,
      user: {
        avatarUrl: string,
        nickname: string,
        userId: number
      }
    }>,
    more: boolean
  }

// 组件
const Page: FC = () => {
  // 视频信息
  const [ videoInfo, setVideoInfo ] = useState<videoInfo>(
    {
          coverUrl: '',
          title: '',
          shareCount: 0,
          playTime: 0,
          praisedCount: 0,
          commentCount: 0,
          subscribeCount: 0,
          creator: {
            nickname: '',
            avatarUrl: ''
          },
          videoGroup: []
    }
  )
  // 视频地址
  const [ videoUrl, setVideoUrl ] = useState<string>('')
  // 相关列表
  const [ relatedList, setRelatedList ] = useState<relatedList>([])
  // mv信息
  const [ mvInfo, setMvInfo ] = useState<mvInfo>(
    {
        cover: '',
        name: '',
        briefDesc: '',
        desc: '',
        shareCount: 0,
        playCount: 0,
        likeCount: 0,
        commentCount: 0,
        subCount: 0,
        artists: [],
        publishTime: '',
        avatarUrl: ''
    }
  )
  // mv相关列表
  const [ mvRelatedList, setMvRelatedList ] = useState<mvRelatedList>([])
  // 显示更多信息
  const [ showMoreInfo, setShowMoreInfo ] = useState<boolean>(false)
  // 类型
  const [ type, setType ] = useState<any>('')
  // 评论信息
  const [ commentInfo, setCommentInfo ] = useState<commentInfo>(
    {
      commentList: [],
      more: true
    }
  )
  // 路由
  const router = useRouter()
  // 路由参数
  const routerParams = router.params
  // 获取路由参数中的id
  const { id } = routerParams

  // 类似与生命周期 useEffect作用于渲染后
  useEffect(() => {
    setType(routerParams.type)
    getDetailByType(id)
  }, [id])

  // 按分类获取详情
  function getDetailByType(id) {
    const { type } = router.params
    if (type === 'mv') {
      getMvDetail(id)
    } else {
      getVideoDetail(id)
    }
  }

  // 获取mv详情
  function getMvDetail(id) {
    // 创建 video 上下文 VideoContext 对象。
    const videoContext = Taro.createVideoContext('myVideo')
    videoContext.pause()
    // 获取API请求 mv详情
    api.get('/mv/detail', {
      mvid: id
    }).then(({ data }) => {
      console.log('mv', data)
      if (data.data) {
        let mvInfo = data.data
        api.get('/artists', {
          id: data.data.artists[0].id
        }).then(({ data }) => {
          // artist.picUrl
          mvInfo.avatarUrl = data.artist.picUrl
          setMvInfo(mvInfo)
        })
      }
    })
    // 获取API请求 mv详情
    api.get('/mv/url', {
      id
    }).then(({ data }) => {
      console.log('mv-url', data)
      if (data.data && data.data.url) {
        setVideoUrl(data.data.url)
      }
    })
    // 获取API请求 mv详情
    api.get('/simi/mv', {
      mvid: id
    }).then(({ data }) => {
      console.log('mv sim', data)
      if (data.mvs && data.mvs.length) {
        setMvRelatedList(data.mvs)
      }
    })
    getCommentInfo()
  }

  function getVideoDetail(id) {
    const videoContext = Taro.createVideoContext('myVideo')
    videoContext.pause()
    api.get('/video/detail', {
      id
    }).then(({ data }) => {
      console.log('video', data)
      if (data.data) {
        setVideoInfo(data.data)
      }
    })
    api.get('/video/url', {
      id
    }).then(({ data }) => {
      console.log('video-url', data)
      if (data.urls && data.urls.length) {
        setVideoUrl(data.urls[0].url)
      }
    })
    api.get('/related/allvideo', {
      id
    }).then(({ data }) => {
      console.log('related', data)
      if (data.data && data.data.length) {
        setRelatedList(data.data)
      }
    })
    getCommentInfo()
  }

  // 获取评论信息
  function getCommentInfo() {
    const { type, id } = router.params
    // const type = 'video'
    // const id = '5DCA972C0F5C920F22F91997A931D326'
    api.get(`/comment/${type}`, {
      id,
      limit: 20,
      offset: commentInfo.commentList.length
    }).then(({ data }) => {
      console.log('comment', data)
      if (data.comments) {
        setCommentInfo({
          commentList: commentInfo.commentList.concat(data.comments),
          more: data.more
        })
      }
    })
  }

  // 格式化持续时间
  function formatDuration(ms: number) {
    // @ts-ignore
    let minutes: string = formatNumber(parseInt(ms / 60000))
    // @ts-ignore
    let seconds: string = formatNumber(parseInt((ms / 1000) % 60))
    return `${minutes}:${seconds}`
  }

  // 选择更多信息
  function switchMoreInfo() {
    setShowMoreInfo(!showMoreInfo)
  }


    return (
      <View className='videoDetail_container'>
        {/* 视频播放 */}
        <Video
          src={videoUrl}
          controls={true}
          autoplay={false}
          poster={type === 'video' ? videoInfo.coverUrl : mvInfo.cover}
          className='videoDetail__play'
          loop={false}
          muted={false}
          id="myVideo"
        />
        {/* 视频详情 */}
        <ScrollView scrollY className='videoDetail_scroll' onScrollToLower={() => getCommentInfo()}>
          {
            (!videoInfo.title && !mvInfo.name) ? <CLoading /> : ''
          }
          {
            // 显示视频详情
            type === 'video' ?
            <View className='videoDetail__play__container'>
              <View className='videoDetail__play__title'>
                {videoInfo.title}
              </View>
              <View className='videoDetail__play__desc'>
                <Text className='videoDetail__play__playtime'>{ formatCount(videoInfo.playTime) }次观看</Text> 
                {
                  videoInfo.videoGroup.map((videoGroupItem) => <Text className='videoDetail__play__tag' key={videoGroupItem.id}>{videoGroupItem.name}</Text>)
                }
              </View>
              <View className='flex videoDetail__play__numinfo'>
                <View className='flex-item'>
                  <AtIcon prefixClass='fa' value='thumbs-o-up' size='24' color='#323232'></AtIcon>
                  <View className='videoDetail__play__numinfo__text'>{videoInfo.praisedCount}</View>
                </View>
                <View className='flex-item'>
                  <AtIcon value='star' size='24' color='#323232'></AtIcon>
                  <View className='videoDetail__play__numinfo__text'>{videoInfo.subscribeCount}</View>
                </View>
                <View className='flex-item'>
                  <AtIcon value='message' size='24' color='#323232'></AtIcon>
                  <View className='videoDetail__play__numinfo__text'>{videoInfo.commentCount}</View>
                </View>
                <View className='flex-item'>
                  <AtIcon value='share' size='24' color='#323232'></AtIcon>
                  <View className='videoDetail__play__numinfo__text'>{videoInfo.shareCount}</View>
                </View>
              </View>
              <View className='videoDetail__play__user'>
                <Image src={videoInfo.creator.avatarUrl} className='videoDetail__play__user__cover'/>
                <Text>{videoInfo.creator.nickname}</Text>
              </View>
            </View> :
            <View className='videoDetail__play__container'>
              <View className='videoDetail__play__title flex flex-between'>
                <Text>
                  {mvInfo.name}
                </Text>
                <AtIcon value={showMoreInfo ? 'chevron-up' : 'chevron-down'} size='20' color='#323232' onClick={() => switchMoreInfo()}></AtIcon>
              </View>
              <View className='videoDetail__play__desc'>
                <Text className='videoDetail__play__playtime'>{ formatCount(mvInfo.playCount) }次观看</Text> 
              </View>
              {
                //显示更多信息
                showMoreInfo ? 
                <View className='videoDetail__play__descinfo'>
                  <View>
                    发行： {mvInfo.publishTime}
                  </View>
                  <CWhiteSpace size='xs' color='#ffffff'/>
                  <View>
                    {mvInfo.briefDesc}
                  </View>
                  <CWhiteSpace size='xs' color='#ffffff'/>
                  <View>
                    {mvInfo.desc}
                  </View>
                </View> : ''
              }
              {/* 点赞 收藏 评论 转发 */}
              <View className='flex videoDetail__play__numinfo'>
                <View className='flex-item'>
                  <AtIcon prefixClass='fa' value='thumbs-o-up' size='24' color='#323232'></AtIcon>
                  <View className='videoDetail__play__numinfo__text'>{mvInfo.likeCount}</View>
                </View>
                <View className='flex-item'>
                  <AtIcon value='star' size='24' color='#323232'></AtIcon>
                  <View className='videoDetail__play__numinfo__text'>{mvInfo.subCount}</View>
                </View>
                <View className='flex-item'>
                  <AtIcon value='message' size='24' color='#323232'></AtIcon>
                  <View className='videoDetail__play__numinfo__text'>{mvInfo.commentCount}</View>
                </View>
                <View className='flex-item'>
                  <AtIcon value='share' size='24' color='#323232'></AtIcon>
                  <View className='videoDetail__play__numinfo__text'>{mvInfo.shareCount}</View>
                </View>
              </View>
              {/* 歌手信息 图片 名字 */}
              <View className='videoDetail__play__user'>
                <Image src={mvInfo.avatarUrl} className='videoDetail__play__user__cover'/>
                <Text>{mvInfo.artists[0].name}</Text>
              </View>
            </View>
          }
          {/* 空格 */}
          <CWhiteSpace size='sm' color='#f8f8f8'/>
          {/* 相关推荐 */}
          <View className='videoDetail_relation'>
            <View className='videoDetail__title'>
              相关推荐
            </View>
            {
              type === 'video' ?
              <View>
                { !relatedList.length ? <CLoading /> : ''}
                {
                  relatedList.map((item) => (
                    <View className='search_content__video__item' key={item.vid} onClick={() => getDetailByType(item.vid)}>
                      <View className='search_content__video__item__cover--wrap'>
                        <View className='search_content__video__item__cover--playtime'>
                          <Text className='at-icon at-icon-play'></Text>
                          <Text>{formatCount(item.playTime)}</Text>
                        </View>
                        <Image src={item.coverUrl} className='search_content__video__item__cover'/>
                      </View>
                      <View className='search_content__video__item__info'>
                        <View className='search_content__video__item__info__title'>
                          {item.title}
                        </View>
                        <View className='search_content__video__item__info__desc'>
                          <Text>{formatDuration(item.durationms)},</Text>
                          <Text className='search_content__video__item__info__desc__nickname'>
                            by {item.creator[0].userName}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                }
              </View> :
              <View>
                { !mvRelatedList.length ? <CLoading /> : ''}
                {
                  mvRelatedList.map((item) => (
                    <View className='search_content__video__item' key={item.id} onClick={() => getDetailByType(item.id)}>
                      <View className='search_content__video__item__cover--wrap'>
                        <View className='search_content__video__item__cover--playtime'>
                          <Text className='at-icon at-icon-play'></Text>
                          <Text>{formatCount(item.playCount)}</Text>
                        </View>
                        <Image src={item.cover} className='search_content__video__item__cover'/>
                      </View>
                      <View className='search_content__video__item__info'>
                        <View className='search_content__video__item__info__title'>
                          {item.name}
                        </View>
                        <View className='search_content__video__item__info__desc'>
                          <Text>{formatDuration(item.duration)},</Text>
                          <Text className='search_content__video__item__info__desc__nickname'>
                            by {item.artistName}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                }
              </View>
            }
          </View>
          <CWhiteSpace size='sm' color='#f8f8f8'/>
          <View className='videoDetail__comment'>
            <View className='videoDetail__title'>
              精彩评论
            </View>
            <View className='videoDetail__comment__info'>
              {
                commentInfo.commentList.map((item) => 
                  <View key={item.commentId} className='videoDetail__comment__info__item'>
                    <View className='flex flex-between'>
                      <View className='flex flex-align-center'>
                        <Image src={item.user.avatarUrl} className='videoDetail__comment__info__item__avatar'/>
                        <View className='flex-item'>
                          <View className='videoDetail__comment__info__item__nickname'>{item.user.nickname}</View>
                          <View className='videoDetail__comment__info__item__time'>{formatTimeStampToTime(item.time)}</View>
                        </View>
                      </View>
                      <View className={
                        classnames({
                          videoDetail__comment__info__item__likecount: true,
                          like: item.liked
                        })}>
                        {
                          item.likedCount ? item.likedCount : ''
                        }
                        <AtIcon prefixClass='fa' value='thumbs-o-up' size='12' color='#323232'></AtIcon>
                      </View>
                    </View>
                    <View className='videoDetail__comment__info__item__content'>{item.content}</View>
                  </View>
                )
              }
            </View>
            { commentInfo.more ? <CLoading /> : ''}
          </View>  
        </ScrollView>
      </View>
    )
}

Page.config = {
  navigationBarTitleText: '精彩视频'
}

export default Page
