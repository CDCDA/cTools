/*
 * @Description:主题数据
 */

import { defineStore } from "pinia";
import { ref } from "vue";

const useThemeStore = defineStore("theme", () => {
  const isShow = ref(false);
  const isFooterShow = ref(false);
  //主题风格
  const theme = ref("theme-white");
  //背景类型
  const backType = ref("img");
  const imgWallpaperList = ref([]) as any;
  const isCollapse = ref(false);
  //背景url
  const backUrl = ref(new URL("@/assets/images/feitu-bridge.jpg", import.meta.url).href);
  //外观设置
  const options = ref({
    //粒子特效
    isParticles: false,
    //樱花特效
    isSakura: false,
    //首页字体颜色
    mhFontColor: "#fff",
    //字体
    fontFamily: "Shark",
    dialogType: "filter",
  } as any);
  return {
    isShow,
    isFooterShow,
    theme,
    backType,
    options,
    backUrl,
    isCollapse,
    imgWallpaperList,
  };
});

export default useThemeStore;
