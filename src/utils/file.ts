import {
  mkdir,
  exists,
  readDir,
  readTextFile,
  remove,
  rename,
  writeTextFile,
  type FileEntry,
  type FsOptions,
  type ReadDirOptions,
} from "@tauri-apps/plugin-fs";
import { BaseDirectory } from "@tauri-apps/api/path";

import {
  open as openDialog,
  save as saveDialog,
  type OpenDialogOptions,
  type SaveDialogOptions,
} from "@tauri-apps/plugin-dialog";
import { appDataDir, homeDir, resourceDir } from "@tauri-apps/api/path";

/**
 * 一个封装了 Tauri 文件系统 (fs) 和对话框 (dialog) 插件常用功能的静态工具类。
 * 所有方法都包含了错误处理，并在失败时返回 null 或 false。
 */
export class fsApi {
  // --- 路径辅助 ---

  /**
   * 获取应用程序数据目录的路径。
   * @returns {Promise<string>} 目录的绝对路径。
   */
  public static getAppDataDir(): Promise<string> {
    return appDataDir();
  }

  /**
   * 获取用户主目录的路径。
   * @returns {Promise<string>} 目录的绝对路径。
   */
  public static getHomeDir(): Promise<string> {
    return homeDir();
  }

  /**
   * 获取应用程序资源目录的路径。
   * @returns {Promise<string>} 目录的绝对路径。
   */
  public static getResourceDir(): Promise<string> {
    return resourceDir();
  }

  // --- 文本文件读写 ---

  /**
   * 读取指定路径的文本文件。
   * @param filePath - 文件的相对路径。
   * @param baseDir - 路径解析的起始目录，默认为 AppData。
   * @returns {Promise<string | null>} 文件内容，如果失败则返回 null。
   */
  public static async readText(filePath: string, baseDir: any = BaseDirectory.AppData): Promise<string | null> {
    try {
      return await readTextFile(filePath, { dir: baseDir });
    } catch (error) {
      console.error(`[TauriFsApi] Error reading text file "${filePath}":`, error);
      return null;
    }
  }

  /**
   * 将文本或 JSON 对象写入指定文件。
   * @param filePath - 文件的相对路径。
   * @param contents - 要写入的字符串或可序列化为 JSON 的对象。
   * @param baseDir - 路径解析的起始目录，默认为 AppData。
   * @returns {Promise<boolean>} 如果成功则返回 true，否则返回 false。
   */
  public static async writeText(
    filePath: string,
    contents: string | object,
    baseDir: any = BaseDirectory.AppData
  ): Promise<boolean> {
    try {
      const dataToWrite = typeof contents === "string" ? contents : JSON.stringify(contents, null, 2);
      await writeTextFile(filePath, dataToWrite, { dir: baseDir });
      return true;
    } catch (error) {
      console.error(`[TauriFsApi] Error writing text file "${filePath}":`, error);
      return false;
    }
  }

  // --- 文件与目录管理 ---

  /**
   * 检查指定路径的文件或目录是否存在。
   * @param path - 文件的相对路径。
   * @param baseDir - 路径解析的起始目录，默认为 AppData。
   * @returns {Promise<boolean>} 如果存在则返回 true，否则返回 false。
   */
  public static async pathExists(path: string, baseDir: any = BaseDirectory.AppData): Promise<boolean> {
    try {
      return await exists(path, { dir: baseDir });
    } catch (error) {
      console.error(`[TauriFsApi] Error checking existence of "${path}":`, error);
      return false;
    }
  }

  /**
   * 创建一个目录。
   * @param dirPath - 目录的相对路径。
   * @param options - FsOptions，包含 baseDir 和 recursive 选项。
   * @returns {Promise<boolean>} 如果成功则返回 true，否则返回 false。
   */
  public static async mkDirectory(dirPath: string, options: { dir: any; recursive: true }): Promise<boolean> {
    try {
      await mkdir(dirPath, options);
      return true;
    } catch (error) {
      console.error(`[TauriFsApi] Error creating directory "${dirPath}":`, error);
      return false;
    }
  }

  /**
   * 删除一个文件。
   * @param filePath - 文件的相对路径。
   * @param baseDir - 路径解析的起始目录，默认为 AppData。
   * @returns {Promise<boolean>} 如果成功则返回 true，否则返回 false。
   */
  public static async remove(filePath: string, baseDir: any = BaseDirectory.AppData): Promise<boolean> {
    try {
      await remove(filePath, { dir: baseDir });
      return true;
    } catch (error) {
      console.error(`[TauriFsApi] Error removing file "${filePath}":`, error);
      return false;
    }
  }

  /**
   * 删除一个目录。
   * @param dirPath - 目录的相对路径。
   * @param options - FsOptions，包含 baseDir 和 recursive 选项。
   * @returns {Promise<boolean>} 如果成功则返回 true，否则返回 false。
   */
  public static async removeDirectory(dirPath: string, options: { dir: any; recursive: true }): Promise<boolean> {
    try {
      await remove(dirPath, options);
      return true;
    } catch (error) {
      console.error(`[TauriFsApi] Error removing directory "${dirPath}":`, error);
      return false;
    }
  }

  /**
   * 重命名或移动文件/目录。**注意：路径必须是绝对路径**。
   * @param oldPath - 原始的绝对路径。
   * @param newPath - 新的绝对路径。
   * @returns {Promise<boolean>} 如果成功则返回 true，否则返回 false。
   */
  public static async rename(oldPath: string, newPath: string): Promise<boolean> {
    try {
      await rename(oldPath, newPath);
      return true;
    } catch (error) {
      console.error(`[TauriFsApi] Error renaming from "${oldPath}" to "${newPath}":`, error);
      return false;
    }
  }

  // --- 目录遍历 ---

  /**
   * 读取并返回目录中的所有条目（文件和子目录）。
   * @param dirPath - 目录的相对路径。
   * @param options - ReadDirOptions，包含 baseDir 和 recursive 选项。
   * @returns {Promise<FileEntry[] | null>} 包含文件条目的数组，如果失败则返回 null。
   */
  public static async readDirectory(
    dirPath: string,
    options: { baseDir: BaseDirectory.AppData; recursive: true }
  ): Promise<[] | null> {
    try {
      return await readDir(dirPath, options);
    } catch (error) {
      console.error(`[TauriFsApi] Error reading directory "${dirPath}":`, error);
      return null;
    }
  }

  // --- 用户对话框 ---

  /**
   * 打开一个文件选择对话框，让用户选择一个或多个文件。
   * @param options - 对话框配置选项。
   * @returns {Promise<string | string[] | null>} 用户选择的文件路径，如果取消则返回 null。
   */
  public static async openFileDialog(options?: OpenDialogOptions): Promise<string | string[] | null> {
    try {
      return await openDialog(options);
    } catch (error) {
      console.error(`[TauriFsApi] Error opening file dialog:`, error);
      return null;
    }
  }

  /**
   * 打开一个文件保存对话框，让用户选择保存位置。
   * @param options - 对话框配置选项。
   * @returns {Promise<string | null>} 用户选择的保存路径，如果取消则返回 null。
   */
  public static async saveFileDialog(options?: SaveDialogOptions): Promise<string | null> {
    try {
      return await saveDialog(options);
    } catch (error) {
      console.error(`[TauriFsApi] Error opening save dialog:`, error);
      return null;
    }
  }
}
