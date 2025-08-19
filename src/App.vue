<template>
  <div class="app-container">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import { useRouter } from "vue-router";
// import { listen } from "@tauri-apps/api/event";
const router = useRouter();
import { getCurrentWindow } from "@tauri-apps/api/window";
const currentWindow = getCurrentWindow();
const initRegister = async () => {
  try {
    await unregister("CommandOrControl+B");
  } finally {
    await register("CommandOrControl+B", () => {
      currentWindow.hide();
    });
  }
  try {
    await unregister("CommandOrControl+L");
  } finally {
    await register("CommandOrControl+L", () => {
      currentWindow.show();
      currentWindow.setFocus();
    });
  }
};
initRegister();
if (currentWindow.label == "main") {
  router.push({ name: "home" });
} else {
  router.push({ name: currentWindow.label, query: { key: currentWindow.label } });
}
// listen("tauri://blur", () => {
//   setTimeout(() => {
//     currentWindow.hide();
//   }, 500);
// });
</script>

<style>
body {
  overflow: hidden;
  margin: 0;
}
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
</style>
