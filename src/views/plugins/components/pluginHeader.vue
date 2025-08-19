<template>
  <div class="plugin-header" data-tauri-drag-region>
    <div class="plugin-header-left" data-tauri-drag-region>
      <div>{{ props.plugin.name }}</div>
    </div>
    <div class="plugin-header-center" data-tauri-drag-region>
      <el-input
        class="plugin-header-search"
        data-tauri-drag-region
        v-model="searchText"
        v-prevent-drag
        placeholder="请输入关键字"
      />
    </div>
    <div class="plugin-header-right" data-tauri-drag-region>
      <svg-icon iconName="otherSvg-缩小" @click="lessen" />
      <!-- <svg-icon iconName="otherSvg-刷新" @click="changeDialogType" /> -->
      <!-- <svg-icon iconName="otherSvg-缩小窗口" @click="blowUp" v-if="isFull" /> -->
      <svg-icon iconName="otherSvg-放大窗口" @click="blowUp" />
      <svg-icon iconName="otherSvg-关闭" @click="close" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, Directive, watch } from "vue";
import { getCurrentWindow } from "@tauri-apps/api/window";
const currentWindow = getCurrentWindow();
const emit = defineEmits(["handleSearch"]);
const props = defineProps({
  plugin: {
    type: Object,
    default: () => ({}),
  },
});
const searchText = ref("");
onMounted(async () => {});
watch(
  () => searchText.value,
  (val) => {
    emit("handleSearch", val);
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

const lessen = () => {
  currentWindow.minimize();
};
const blowUp = () => {
  currentWindow.unminimize();
};
const close = () => {
  currentWindow.close();
};
</script>

<style lang="scss" scoped>
.plugin-header {
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #a0a8d0;
  z-index: 999;
  user-select: none;
  border-bottom: 1px solid #ccc;
  .plugin-header-left {
    height: 100%;
    margin: 0 20px;
    width: fit-content;
    display: flex;
    align-items: center;
    justify-content: center;
    color: black;
    font-weight: bold;
    font-size: 20px;
  }
  .plugin-header-center {
    flex: 1;
  }
  .plugin-header-right {
    height: 100%;
    width: 150px;
    display: flex;
    align-items: center;
    justify-content: end;
    padding-right: 15px;
    .svg-icon {
      font-size: 25px;
      margin-left: 10px;
      cursor: pointer;
      color: rgb(99, 99, 99);
    }
  }
  .plugin-header-search {
    height: 100%;
    :deep(.el-input__wrapper) {
      padding-left: 22px;
      border-radius: 0 !important;
      box-shadow: none;
      .el-input__inner {
        font-size: 20px !important;
      }
    }
  }
}
</style>
