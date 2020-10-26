import Taro, { useState, FC, memo } from "@tarojs/taro";
import { View, Image } from "@tarojs/components";
import { AtIcon, AtFloatLayout } from "taro-ui";
import classnames from "classnames";
import { currentSongInfoType, MusicItemType } from "../../constants/commonType";
import "./index.scss";
type Props = {
  songInfo: {
    currentSongInfo: currentSongInfoType;
    isPlaying: boolean;
    canPlayList: Array<MusicItemType>;
  };
  isHome?: boolean;
  onUpdatePlayStatus: (object) => any;
};

const backgroundAudioManager = Taro.getBackgroundAudioManager();

const CMusic: FC<Props> = ({ songInfo, isHome, onUpdatePlayStatus }) => {
  console.log("CMusic Render");
  // 进入新的界面都会渲染
  console.log("进入新界面")
  let { currentSongInfo, isPlaying, canPlayList } = songInfo;
  // hook
  const [isOpened, setIsOpened] = useState(false);
  const updatePlayStatusFunc = onUpdatePlayStatus;
  currentSongInfo = currentSongInfo || {};
  // 当前歌曲信息名字不存在时 返回空
  if (!currentSongInfo.name) return <View></View>;
  function goDetail() {
    const { id } = currentSongInfo;
    console.log("进入歌曲详情")
    Taro.navigateTo({
      url: `/pages/songDetail/index?id=${id}`
    });
  }

  // 切换播放状态
  function switchPlayStatus() {
    console.log("切换播放状态")
    const { isPlaying } = songInfo;
    if (isPlaying) {
      backgroundAudioManager.pause();
      updatePlayStatusFunc({
        isPlaying: false
      });
    } else {
      backgroundAudioManager.play();
      updatePlayStatusFunc({
        isPlaying: true
      });
    }
  }

  // 播放歌曲
  function playSong(id) {
    console.log("播放歌曲")
    Taro.navigateTo({
      url: `/pages/songDetail/index?id=${id}`
    });
  }

  // 歌曲播放界面
  return (
    <View
      className={classnames({
        music_components: true,
        isHome: isHome
      })}
    >
      {/* 图片 */}
      <Image
        className={classnames({
          music__pic: true,
          "z-pause": false,
          circling: isPlaying
        })}
        src={currentSongInfo.al.picUrl}
      />
      {/* 歌词详情 包括 歌名  歌词 */}
      <View className="music__info" onClick={() => goDetail()}>
        <View className="music__info__name">{currentSongInfo.name}</View>
        <View className="music__info__desc">
          {currentSongInfo.ar[0] ? currentSongInfo.ar[0].name : ""} -{" "}
          {currentSongInfo.al.name}
        </View>
      </View>
      {/* 播放标签 播放 暂停 播放列表 */}
      <View className="music__icon--play">
        <AtIcon
          value={isPlaying ? "pause" : "play"}
          size="30"
          color="#FFF"
          onClick={() => switchPlayStatus()}
        ></AtIcon>
      </View>
      <AtIcon
        value="playlist"
        size="30"
        color="#FFF"
        className="icon_playlist"
        onClick={() => setIsOpened(true)}
      ></AtIcon>
      <AtFloatLayout
        isOpened={isOpened}
        title="播放列表"
        scrollY
        onClose={() => setIsOpened(false)}
      >
        <View className="music__playlist">
          {canPlayList.map(item => (
            <View
              key={item.id}
              className={classnames({
                music__playlist__item: true,
                current: item.current
              })}
            >
              <View
                className="music__playlist__item__info"
                onClick={() => playSong(item.id)}
              >
                {`${item.name} - ${item.ar[0] ? item.ar[0].name : ""}`}
              </View>
              <View className="music__playlist__item__close">
                <AtIcon value="chevron-right" size="16" color="#ccc" />
              </View>
            </View>
          ))}
        </View>
      </AtFloatLayout>
    </View>
  );
};

// 默认属性
CMusic.defaultProps = {
  songInfo: {
    currentSongInfo: {
      id: 0,
      name: "",
      ar: [],
      al: {
        picUrl: "",
        name: ""
      },
      url: "",
      lrcInfo: "",
      dt: 0, // 总时长，ms
      st: 0 // 是否喜欢
    },
    canPlayList: [],
    isPlaying: false
  }
};
// const shouldUpdate =
// 通过memo来避免不必要的渲染,提高响应速度
export default memo(CMusic, (prevProps, nextProps) => {
  console.log("prevProps =>", prevProps);
  console.log("nextProps =>", nextProps);
  if (
    nextProps.songInfo.isPlaying !== prevProps.songInfo.isPlaying ||
    nextProps.songInfo.currentSongInfo.name !==
      prevProps.songInfo.currentSongInfo.name
  ) {
    return false; // 返回false本次则会渲染，反之则不会渲染
  }
  return true;
});
