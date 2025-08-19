/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
declare module "@tauri-apps/plugin-fs";
declare module "@tauri-apps/api";
declare module "vue-router";
declare module "vite-plugin-monaco-editor";
declare module "@/utils/window.ts";
declare module "@/windows/index.js";
