import Taro, { FC, memo } from "@tarojs/taro";
import classnames from "classnames";
import { View, Image } from "@tarojs/components";

import "./index.scss";
type Props = {
  isFixed: boolean;
};

const CTitle: FC<Props> = ({ isFixed }) => {
  const cls = classnames({
    title_components: true,
    fixed: isFixed
  });
  console.log("加载首页 头部名称")
  return (
    <View className={cls}>
      <Image
        className="title_components__logo"
        src={require("../../assets/images/logo.png")}
      />
    </View>
  );
};

export default memo(CTitle, (oldProps, newProps) => {
  return oldProps.isFixed === newProps.isFixed;
});
