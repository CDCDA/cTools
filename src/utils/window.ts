import { getCurrentWindow } from "@tauri-apps/api/window";
export const currentWindow = getCurrentWindow();

// 获取内容尺寸并调整窗口
export const adjustWindowSize = async () => {
  let content = document.querySelector(".home-container");
  if (!content) return;

  // 获取内容的实际尺寸
  const rect = content.getBoundingClientRect();

  const width: any = rect.width;
  const height: any = rect.height;
  if (!width || !height) return;
  // 调整窗口大小
  try {
    await currentWindow.setSize({
      type: "Physical",
      width: parseInt(width),
      height: parseInt(height),
    } as any);
  } catch (error) {
    console.error("调整窗口大小失败:", error);
  }
};

// 获取内容尺寸并调整窗口
export const setWindowSize = async (width: any, height: any) => {
  if (!width) width = 800;
  if (!height) height = 600;
  try {
    await currentWindow.setSize({
      type: "Physical",
      width: parseInt(width),
      height: parseInt(height),
    } as any);
  } catch (error) {
    console.error("设置窗口大小失败:", error);
  }
};
