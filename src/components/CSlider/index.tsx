import Taro, { FC, memo } from "@tarojs/taro";
import { View, Slider } from "@tarojs/components";

import "./index.scss";

type Props = {
  percent: number;
  onChange: (object) => any;
  onChanging: (object) => any;
};

// 广告项 滑动
const CSlider: FC<Props> = ({ percent }) => {
  console.log("CSlider render");
  return (
    <View className="slider_components">
      <Slider
        value={percent}
        blockSize={15}
        activeColor="#d43c33"
        onChange={e => this.props.onChange(e)}
        onChanging={e => this.props.onChanging(e)}
      />
    </View>
  );
};

// 优化渲染
export default memo(CSlider, (prevProps, nextProps) => {
  return prevProps.percent === nextProps.percent;
});
