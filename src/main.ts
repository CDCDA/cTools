import { createApp } from "vue";
import App from "./App.vue";
import tray_init from "./utils/tray.ts";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./assets/styles/index.scss";
import router from "./router";
import image from "./components/image/index.vue";
import SvgIcon from "./components/svgIcon/index.vue";
import "virtual:svg-icons-register";
import { getCurrentWindow } from "@tauri-apps/api/window";
const currentWindow = getCurrentWindow();
// 初始化系统托盘
if (currentWindow.label == "main") {
  tray_init();
}

const app = createApp(App);
app.component("c-image", image);
app.component("svg-icon", SvgIcon);
app.use(ElementPlus);
app.use(router);
app.mount("#app");
