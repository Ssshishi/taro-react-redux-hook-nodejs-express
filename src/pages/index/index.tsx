// 进入页面
import { ComponentClass } from "react";
import Taro, { Component, Config } from "@tarojs/taro";
import { View, Image, Text, Swiper, SwiperItem, ScrollView } from "@tarojs/components";
import { AtTabBar, AtSearchBar, AtIcon } from "taro-ui";
import { connect } from "@tarojs/redux";
import classnames from "classnames";
// 组件
import CLoading from "../../components/CLoading";
import CMusic from "../../components/CMusic";
// API请求 退出播放 歌曲类型 action事件
import api from "../../services/api";
import { injectPlaySong } from "../../utils/decorators";
import { songType } from "../../constants/commonType";
import {
  getRecommendPlayList,
  getRecommendDj,
  getRecommendNewSong,
  getRecommend,
  getSongInfo,
  updatePlayStatus
} from "../../actions/song";

// 样式
import "./index.scss";

// #region 书写注意
//
// 目前 typescript 版本还无法在装饰器模式下将 Props 注入到 Taro.Component 中的 props 属性
// 需要显示声明 connect 的参数类型并通过 interface 的方式指定 Taro.Component 子类的 props
// 这样才能完成类型检查和 IDE 的自动提示
// 使用函数模式则无此限制
// ref: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20796

// 页面状态属性
type PageStateProps = {
  song: songType;
  counter: {
    num: number;
  };
  recommendPlayList: Array<{
    id: number;
    name: string;
    picUrl: string;
    playCount: number;
  }>;
  recommendDj: Array<{
    name: string;
    picUrl: string;
  }>;
  recommendNewSong: any;
  recommend: any;
};

// 页面被发送过来的属性
type PageDispatchProps = {
  getRecommendPlayList: () => any;
  getRecommendDj: () => any;
  getRecommendNewSong: () => any;
  getRecommend: () => any;
  getSongInfo: (object) => any;
  updatePlayStatus: (object) => any;
};

// 页面自己的属性
type PageOwnProps = {};

// 页面状态
type PageState = {
  current: number;
  showLoading: boolean;
  bannerList: Array<{
    typeTitle: string;
    pic: string;
    targetId: number;
  }>;
  searchValue: string;
};

// 获取所有属性
type IProps = PageStateProps & PageDispatchProps & PageOwnProps;

interface Index {
  props: IProps;
}

// 退出播放 装饰器
@injectPlaySong()
@connect(
  ({ song }) => ({
    song: song,
    recommendPlayList: song.recommendPlayList,
    recommendDj: song.recommendDj,
    recommendNewSong: song.recommendNewSong,
    recommend: song.recommend
  }),
  dispatch => ({
    getRecommendPlayList() {
      dispatch(getRecommendPlayList());
    },
    getRecommendDj() {
      dispatch(getRecommendDj());
    },
    getRecommendNewSong() {
      dispatch(getRecommendNewSong());
    },
    getRecommend() {
      dispatch(getRecommend());
    },
    getSongInfo(object) {
      dispatch(getSongInfo(object));
    },
    updatePlayStatus(object) {
      dispatch(updatePlayStatus(object));
    }
  })
)


class Index extends Component<IProps, PageState> {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: "网易云音乐"
  };

  constructor(props) {
    super(props);
    // 状态： 当前 显示加载中 广告项 搜索值
    this.state = {
      current: 0,
      showLoading: true,
      bannerList: [],
      searchValue: ""
    };
  }

  // 生命周期 将接收props 转换为 state
  componentWillReceiveProps(nextProps) {
    console.log(this.props, nextProps);
    this.setState({
      showLoading: false
    });
  }

  // 将要挂载 constructor()
  componentWillMount() {
    this.getPersonalized();
    this.getNewsong();
    this.getDjprogram();
    this.getRecommend();
    this.getBanner();
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  componentDidMount() {
    this.removeLoading();
  }

  // 关闭所有页面 打开某个页面
  switchTab(value) {
    if (value !== 1) return;
    Taro.reLaunch({
      url: "/pages/my/index"
    });
  }

  /**
   * 获取推荐歌单
   */
  getPersonalized() {
    this.props.getRecommendPlayList();
  }

  /**
   * 获取推荐新音乐
   */
  getNewsong() {
    this.props.getRecommendNewSong();
  }

  /**
   * 获取推荐电台
   */
  getDjprogram() {
    this.props.getRecommendDj();
  }

  /**
   * 获取推荐节目
   */
  getRecommend() {
    this.props.getRecommend();
  }

  getBanner() {
    api
      .get("/banner", {
        type: 2
      })
      .then(({ data }) => {
        console.log("banner", data);
        if (data.banners) {
          this.setState({
            bannerList: data.banners
          });
        }
      });
  }

  goSearch() {
    Taro.navigateTo({
      url: `/pages/search/index`
    });
  }

  goDetail(item) {
    Taro.navigateTo({
      url: `/pages/playListDetail/index?id=${item.id}&name=${item.name}`
    });
  }

  // 没完成
  goPage(pageName) {
    // Taro.navigateTo({
    //   url: `/pages/${pageName}/index`
    // })
    Taro.showToast({
      title: "正在开发中，敬请期待",
      icon: "none"
    });
  }

  goDjDetail(item) {
    // Taro.showToast({
    //   title: '暂未实现，敬请期待',
    //   icon: 'none'
    // })
    Taro.navigateTo({
      url: `/pages/djprogramListDetail/index?id=${item.id}&name=${item.name}`
    });
  }

  // 删除加载中 当推荐播放列表 或是 推荐电台加入后 将showLoading 变成 false
  removeLoading() {
    const { recommendPlayList, recommendDj } = this.props;
    if (recommendPlayList.length || recommendDj.length) {
      this.setState({
        showLoading: false
      });
    }
  }

  render() {
    const { recommendPlayList, song } = this.props;
    const { showLoading, bannerList, searchValue } = this.state;
    const { currentSongInfo, isPlaying, canPlayList } = song;
    return (
      <View
        className={classnames({
          index_container: true,
          hasMusicBox: !!song.currentSongInfo.name
        })}
      >
{/* 加载页面 当页面加载完成后hide*/}
        <CLoading fullPage={true} hide={!showLoading} />
{/* 音乐 */}
        <CMusic
          songInfo={{
            currentSongInfo,
            isPlaying,
            canPlayList
          }}
          isHome={true}
          onUpdatePlayStatus={this.props.updatePlayStatus.bind(this)}
        />
{/* 搜索  */}
        <View onClick={this.goSearch.bind(this)}>
          <AtSearchBar
            actionName="搜一下"
            disabled={true}
            value={searchValue}
            onChange={this.goSearch.bind(this)}
          />
        </View>
{/* 广告项 */}
        <Swiper
          className="banner_list"
          indicatorColor="#999"
          indicatorActiveColor="#d43c33"
          circular
          indicatorDots
          autoplay
        >
          {bannerList.map(item => (
            <SwiperItem key={item.targetId} className="banner_list__item">
              <Image src={item.pic} className="banner_list__item__img" />
            </SwiperItem>
          ))}
        </Swiper>

{/* tab-bar */}
        <ScrollView className="handle_list" scroll-x >
          <View
            className="handle_list__item"
            onClick={this.goPage.bind(this, "dailyRecommend")}
          >
            <View className="handle_list__item__icon-wrap">
              <AtIcon
                prefixClass="fa"
                value="calendar-o"
                size="25"
                color="#ffffff"
                className="handle_list_item__icon"
              ></AtIcon>
            </View>
            <Text className="handle_list__item__text">每日推荐</Text>
          </View>

          <View
            className="handle_list__item"
            onClick={this.goPage.bind(this, "rank")}
          >
            <View className="handle_list__item__icon-wrap">
              <AtIcon
                prefixClass="fa"
                value="heartbeat"
                size="25"
                color="#ffffff"
                className="handle_list_item__icon"
              ></AtIcon>
            </View>
            <Text className="handle_list__item__text">私人FM</Text>
          </View>

          <View
            className="handle_list__item"
            onClick={this.goPage.bind(this, "rank")}
          >
            <View className="handle_list__item__icon-wrap">
              <AtIcon
                prefixClass="fa"
                value="stack-exchange"
                size="25"
                color="#ffffff"
                className="handle_list_item__icon"
              ></AtIcon>
            </View>
            <Text className="handle_list__item__text">歌单</Text>
          </View>

          <View
            className="handle_list__item"
            onClick={this.goPage.bind(this, "rank")}
          >
            <View className="handle_list__item__icon-wrap">
              <AtIcon
                prefixClass="fa"
                value="bar-chart"
                size="25"
                color="#ffffff"
                className="handle_list_item__icon"
              ></AtIcon>
            </View>
            <Text className="handle_list__item__text">排行榜</Text>
          </View>

          <View
            className="handle_list__item"
            onClick={this.goPage.bind(this, "rank")}
          >
            <View className="handle_list__item__icon-wrap">
              <AtIcon
                prefixClass="fa"
                value="eercast"
                size="25"
                color="#ffffff"
                className="handle_list_item__icon"
              ></AtIcon>
            </View>
            <Text className="handle_list__item__text">直播</Text>
          </View>

          <View
            className="handle_list__item"
            onClick={this.goPage.bind(this, "rank")}
          >
            <View className="handle_list__item__icon-wrap">
              <AtIcon
                prefixClass="fa"
                value="youtube-play"
                size="25"
                color="#ffffff"
                className="handle_list_item__icon"
              ></AtIcon>
            </View>
            <Text className="handle_list__item__text">电台</Text>
          </View>

          <View
            className="handle_list__item"
            onClick={this.goPage.bind(this, "rank")}
          >
            <View className="handle_list__item__icon-wrap">
              <AtIcon
                prefixClass="fa"
                value="cc"
                size="25"
                color="#ffffff"
                className="handle_list_item__icon"
              ></AtIcon>
            </View>
            <Text className="handle_list__item__text">数字专辑</Text>
          </View>

          <View
            className="handle_list__item"
            onClick={this.goPage.bind(this, "rank")}
          >
            <View className="handle_list__item__icon-wrap">
              <AtIcon
                prefixClass="fa"
                value="tripadvisor"
                size="25"
                color="#ffffff"
                className="handle_list_item__icon"
              ></AtIcon>
            </View>
            <Text className="handle_list__item__text">唱聊</Text>
          </View>

          <View
            className="handle_list__item"
            onClick={this.goPage.bind(this, "rank")}
          >
            <View className="handle_list__item__icon-wrap">
              <AtIcon
                prefixClass="fa"
                value="gamepad"
                size="25"
                color="#ffffff"
                className="handle_list_item__icon"
              ></AtIcon>
            </View>
            <Text className="handle_list__item__text">游戏专区</Text>
          </View>

        </ScrollView>
 {/* 推荐歌单 */}
        <View className="recommend_playlist">
          <View className="recommend_playlist__title">推荐歌单</View>
          <View className="recommend_playlist__content">
            {recommendPlayList.map(item => (
              <View
                key={item.id}
                className="recommend_playlist__item"
                onClick={this.goDetail.bind(this, item)}
              >
                <Image
                  src={`${item.picUrl}?imageView&thumbnail=250x0`}
                  className="recommend_playlist__item__cover"
                />
                <View className="recommend_playlist__item__cover__num">
                  <Text className="at-icon at-icon-sound"></Text>
                  {item.playCount < 10000
                    ? item.playCount
                    : `${Number(item.playCount / 10000).toFixed(0)}万`}
                </View>
                <View className="recommend_playlist__item__title">
                  {item.name}
                </View>
              </View>
            ))}
          </View>
        </View>
        {/* <View className='recommend_playlist'>
          <View className='recommend_playlist__title'>
            推荐电台
          </View>
          <View className='recommend_playlist__content'>
            {
              recommendDj.map((item, index) => <View key={index} className='recommend_playlist__item' onClick={this.goDjDetail.bind(this, item)}>
                <Image
                  src={`${item.picUrl}?imageView&thumbnail=250x0`}
                  className='recommend_playlist__item__cover'
                />
                <View className='recommend_playlist__item__title'>{item.name}</View>
              </View>)
            }
          </View>
        </View> */}

{/* 底部tab  */}
        <AtTabBar
          fixed
          selectedColor="#d43c33"
          tabList={[
            { title: "发现", iconPrefixClass: "fa", iconType: "feed" },
            { title: "我的", iconPrefixClass: "fa", iconType: "music" }
          ]}
          onClick={this.switchTab.bind(this)}
          current={this.state.current}
        />

      </View>
    );
  }
}

export default Index as ComponentClass<IProps, PageState>;
