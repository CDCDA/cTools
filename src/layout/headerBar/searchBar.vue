<template>
  <div class="header-bar" data-tauri-drag-region>
    <div class="header-bar-left" data-tauri-drag-region>
      <el-input
        class="header-bar-search"
        data-tauri-drag-region
        v-model="searchText"
        v-prevent-drag
        placeholder="请输入命令/应用"
      />
    </div>
    <div class="header-bar-right" data-tauri-drag-region>
      <c-image class="user-avatar" :src="avatarUrl"></c-image>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, Directive, watch } from "vue";
import { listen } from "@tauri-apps/api/event";
const emit = defineEmits(["pluginSearch"]);
const searchText = ref("");
const currentWindow = ref() as any;
const avatarUrl = new URL("@/assets/images/feitu-bridge.jpg", import.meta.url).href;
onMounted(async () => {
  // currentWindow.value = getCurrentWindow();
  //
  // isMaximized.value = await currentWindow.value.isMaximized();
  //
  // // 监听窗口大小变化
  // const unListen = await currentWindow.value.onResized(() => {
  //   currentWindow.value.isMaximized().then((maximized: any) => {
  //     isMaximized.value = maximized;
  //   });
  // });
  //
  // return () => unListen();
});

watch(
  () => searchText.value,
  (val) => {
    emit("pluginSearch", val);
  }
);

const preventDrag: Directive = {
  mounted(el) {
    el.addEventListener("mousedown", () => {
      const inputElement = el.querySelector(".el-input__inner");
      if (inputElement) {
        inputElement.focus();
      }
    });
  },
};
const vPreventDrag = preventDrag;

onMounted(() => {
  // listen("tauri://blur", () => {
  //   setTimeout(() => {
  //     currentWindow.value.hide();
  //   }, 500);
  // });
});
</script>

<style lang="scss" scoped>
.header-bar {
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #a0a8d0;
  z-index: 999;
  user-select: none;
  border-bottom: 1px solid #ccc;
  .header-bar-left {
    height: 100%;
    width: calc(100% - 60px);
  }
  .header-bar-right {
    height: 100%;
    width: 60px;
    display: flex;
    align-items: center;
    justify-content: end;
    padding-right: 15px;
    .user-avatar {
      width: 35px;
      height: 35px;
      border-radius: 35px;
      cursor: pointer;
    }
    .setting {
      font-size: 25px;
      cursor: pointer;
    }
  }
  .header-bar-search {
    height: 100%;
    :deep(.el-input__wrapper) {
      padding-left: 25px;
      border-radius: 0 !important;
      box-shadow: none;
      .el-input__inner {
        font-size: 20px !important;
      }
    }
  }
}
</style>
