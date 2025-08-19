import { createRouter, createWebHashHistory } from "vue-router";

const routes: Array<any> = [
  {
    path: "/login",
    name: "login",
    meta: { remark: "登录", isHidden: true, cache: false },
    component: () => import("@/views/login/login.vue"),
  },
  {
    path: "/home",
    name: "home",
    meta: { remark: "主页", isHidden: true, cache: false },
    component: () => import("@/views/home/index.vue"),
  },
  {
    path: "/pluginList",
    name: "pluginList",
    meta: { remark: "应用查询", preload: true },
    component: () => import(/* webpackChunkName: "about" */ "/src/views/plugins/pluginList.vue"),
  },
  {
    path: "/plugin",
    name: "plugin",
    meta: { remark: "插件应用(独立窗口)", preload: true },
    component: () => import("@/views/plugins/index.vue"),
    redirect: "/clipboard",
    children: [
      {
        path: "/clipboard",
        name: "clipboard",
        meta: { remark: "剪贴板", preload: true },
        component: () => import("@/views/plugins/clipboard/index.vue"),
      },
      {
        path: "/fileHasher",
        name: "fileHasher",
        meta: { remark: "文件哈希", preload: true },
        component: () => import("@/views/plugins/fileHasher/index.vue"),
      },
      {
        path: "/jsonEditor",
        name: "jsonEditor",
        meta: { remark: "JSON编辑器", preload: true },
        component: () => import("@/views/plugins/jsonEditor/index.vue"),
      },
      {
        path: "/sqlConverter",
        name: "sqlConverter",
        meta: { remark: "sql日志转换", preload: true },
        component: () => import("@/views/plugins/sqlConverter/index.vue"),
      },
      {
        path: "/systemInfo",
        name: "systemInfo",
        meta: { remark: "系统参数", preload: true },
        component: () => import("@/views/plugins/systemInfo/index.vue"),
      },
    ],
  },
];
const router = createRouter({
  history: createWebHashHistory("/"),
  routes,
});

export default router;
