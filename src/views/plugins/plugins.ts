import FileHasher from "@/views/plugins/fileHasher/index.vue";
import SqlConverter from "@/views/plugins/sqlConverter/index.vue";
import JsonEditor from "@/views/plugins/jsonEditor/index.vue";
// import Clipboard from "@/views/plugins/clipboard/index.vue";
import SystemInfo from "@/views/plugins/systemInfo/index.vue";
import FileOrganizer from "@/views/plugins/fileOrganizer/index.vue";
import FileTreeJson from "@/views/plugins/fileTreeJson/index.vue";

export const pluginData = [
  {
    id: 1,
    name: "哈希计算",
    description: "多种算法的哈希计算",
    icon: "pluginIcons-哈希",
    shortcut: "Alt+F",
    type: "tool",
    key: "fileHasher",
    component: FileHasher,
  },
  {
    id: 2,
    name: "sql日志转化",
    description: "用于docker日志的sql转化",
    icon: "pluginIcons-sql",
    shortcut: "= 表达式",
    type: "tool",
    key: "sqlConverter",
    component: SqlConverter,
  },
  // {
  //   id: 3,
  //   name: "翻译-驼峰",
  //   description: "翻译中文到英文并转化为驼峰格式",
  //   icon: "pluginIcons-翻译",
  //   shortcut: "trans 文本",
  //   type: "tool",
  //   key: "",
  // },
  {
    id: 4,
    name: "JSON 格式化",
    description: "格式化和验证 JSON 数据",
    icon: "pluginIcons-json",
    shortcut: "json 内容",
    type: "tool",
    key: "jsonEditor",
    component: JsonEditor,
  },
  // {
  //   id: 5,
  //   name: "剪贴板",
  //   description: "获取和管理剪贴板内容",
  //   icon: "pluginIcons-剪贴板",
  //   shortcut: "ts 时间戳",
  //   type: "tool",
  //   key: "clipboard",
  //   component: Clipboard,
  // },
  // {
  //   id: 6,
  //   name: "备忘",
  //   description: "备忘录",
  //   icon: "pluginIcons-备忘录",
  //   shortcut: "md 内容",
  //   type: "tool",
  //   key: "",
  // },
  {
    id: 7,
    name: "系统信息",
    description: "系统信息",
    icon: "pluginIcons-系统信息",
    shortcut: "md 内容",
    type: "tool",
    key: "systemInfo",
    component: SystemInfo,
  },
  {
    id: 8,
    name: "文件树",
    description: "文件树",
    icon: "pluginIcons-文件树",
    shortcut: "md 内容",
    type: "tool",
    key: "systemInfo",
    component: FileTreeJson,
  },
  {
    id: 9,
    name: "文件整理",
    description: "文件整理",
    icon: "pluginIcons-文件整理",
    shortcut: "md 内容",
    type: "tool",
    key: "systemInfo",
    component: FileOrganizer,
  },
];

export const getPluginByKey = (key: string) => {
  console.log(key);
  const plugin = pluginData.find((item) => {
    console.log(item.key, key);
    return item.key === key;
  });
  console.log(plugin);
  return plugin;
};
