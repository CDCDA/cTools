// tray.ts (或者你原来的文件名)

import { TrayIcon } from "@tauri-apps/api/tray";
import { Menu } from "@tauri-apps/api/menu";
import { getCurrentWindow } from "@tauri-apps/api/window";
// 导入 convertFileSrc
import { convertFileSrc } from "@tauri-apps/api/core";

// 单例变量用于存储托盘实例
let trayInstance: TrayIcon | null = null;

/**
 * 初始化系统托盘
 */
export async function tray_init() {
  // 检查是否已有托盘实例
  if (trayInstance) {
    return;
  }

  // --- 使用 convertFileSrc 来获取初始图标路径 ---
  // 这会返回一个类似 'asset://localhost/icons/tray-default.png' 的路径
  // 确保 'icons/tray-default.png' 已经在 tauri.conf.json 的 resources 中配置
  const initialIconPath = await convertFileSrc("icons/tray-default.png");

  const menu = await Menu.new({
    items: [
      {
        id: "info",
        text: "关于",
        action: () => {
          console.log("info press");
        },
      },
      {
        id: "quit",
        text: "退出",
        action: async () => {
          const appWindow = getCurrentWindow();
          await appWindow.close();
        },
      },
    ],
  });

  const options = {
    // 使用解析后的安全路径设置初始图标
    icon: initialIconPath,
    menu,
    menuOnLeftClick: false,
    action: async (event: any) => {
      if (event.type === "Click" && event.button === "Left") {
        const appWindow = getCurrentWindow();
        await appWindow.unminimize();
        await appWindow.show();
        await appWindow.setFocus();
      }
    },
  };

  // 创建并保存托盘实例
  trayInstance = await TrayIcon.new(options as any);
  changeTrayIcon("32x32.png");
  // （可选）监听窗口销毁事件来清理托盘
  const mainWindow = getCurrentWindow();
  await mainWindow.onCloseRequested(async (event: any) => {
    if (trayInstance) {
      await trayInstance.close();
      trayInstance = null;
    }
    // 继续默认的关闭行为
    return event.payload;
  });

  // 在组件卸载时最好调用 unlisten() 来清理监听器
}

/**
 * 动态修改托盘图标
 * @param iconName - 在 `icons` 目录下的图标文件名，例如 'tray-active.png'
 */
export async function changeTrayIcon(iconName: string) {
  if (!trayInstance) {
    console.warn("未初始化托盘");
    return;
  }

  try {
    // 同样使用 convertFileSrc 来解析新图标的路径
    const newIconPath = await convertFileSrc(`icons/${iconName}`);

    // --- 这就是修改图标的核心方法 ---
    await trayInstance.setIcon(newIconPath);

    console.log(`Tray icon changed to ${iconName}`);
  } catch (error) {
    console.error("Failed to change tray icon:", error);
  }
}

export default tray_init;
