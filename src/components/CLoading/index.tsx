import Taro, { FC, memo } from "@tarojs/taro";
import classnames from "classnames";
import { View } from "@tarojs/components";
import "./index.scss";

type Props = {
  fullPage?: boolean;
  hide?: boolean;
};
// FC 形成自己的组件
// 目前 Taro 编译微信小程序自定义组件时，由于微信使用 web component 的关系，会产生组件自己的标签
const CLoading: FC<Props> = ({ fullPage, hide }) => {
  console.log("CLoading Render");
  const cls = classnames({
    loading_components: true,
    fullScreen: fullPage,
    hide: hide
  });
  return <View className={cls}></View>;
};

// memo 优化性能 只需要渲染一次 之后不用更新了
// memo 第一个参数接受一个函数式组件，
// 第二个参数和我们的 shouldComponentUpdate() 一样，判断组件在什么样的情况下需要更新
export default memo(CLoading, (oldProps, newProps) => {
  // 比较新props和旧props的 fullPage hide 是否相等 不相等则渲染
  return (
    oldProps.fullPage === newProps.fullPage && oldProps.hide === newProps.hide
  );
});
