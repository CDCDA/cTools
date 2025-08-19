<template>
  <div class="plugin-bar" data-tauri-drag-region>
    <div class="plugin-bar-left" data-tauri-drag-region>
      <el-tag class="plugin-name" effect="dark" round closable type="info" @close="close">{{ plugin.name }}</el-tag>
    </div>
    <div class="plugin-bar-center" data-tauri-drag-region>
      <el-input
        class="plugin-bar-search"
        data-tauri-drag-region
        v-model="searchText"
        v-prevent-drag
        placeholder="请输入关键字"
      />
    </div>
    <div class="plugin-bar-right" data-tauri-drag-region>
      <el-dropdown @command="handleCommand">
        <el-icon class="setting">
          <Setting data-tauri-drag-region />
        </el-icon>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="window">分离为独立窗口</el-dropdown-item>
            <el-dropdown-item command="exit">退出</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, Directive, watch } from "vue";
import { getCurrentWindow } from "@tauri-apps/api/window";
import Windows from "@/windows/index.js";
import { listen } from "@tauri-apps/api/event";
import { useRouter } from "vue-router";
const router = useRouter();
const currentWindow = getCurrentWindow();
import { Setting } from "@element-plus/icons-vue";
const props = defineProps({
  plugin: {
    type: Object,
    default: () => ({}),
  },
});
const emit = defineEmits(["handleSearch", "pluginClose"]);
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

const close = () => {
  emit("pluginClose");
};

const handleCommand = async (command: string) => {
  if (command === "window") {
    const newWindow = new Windows();
    newWindow.createWin({
      label: props.plugin.key,
      title: props.plugin.name,
      url: `/plugin/${props.plugin.key}`,
    });
    close();
    currentWindow.hide();
  } else if (command === "exit") {
    router.push({ name: "home" });
    // 退出
  }
};

onMounted(() => {
  listen("tauri://blur", () => {
    setTimeout(() => {
      // currentWindow.value.hide();
    }, 500);
  });
});
</script>

<style lang="scss" scoped>
.plugin-bar {
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #a0a8d0;
  z-index: 999;
  user-select: none;
  border-bottom: 1px solid #ccc;
  .plugin-bar-left {
    height: 100%;
    margin: 0 20px;
    width: fit-content;
    display: flex;
    align-items: center;
    justify-content: center;
    .plugin-name {
      height: 32px;
      font-size: 18px;
      padding-right: 15px;
      padding-left: 20px;

      :deep(.el-tag__close) {
        width: 20px;
        height: 20px;
        font-size: 20px;
      }
      .plugin-close {
        margin-left: 5px;
        cursor: pointer;
      }
    }
  }
  .plugin-bar-center {
    flex: 1;
  }
  .plugin-bar-right {
    height: 100%;
    width: 60px;
    display: flex;
    align-items: center;
    justify-content: end;
    padding-right: 15px;
    .setting {
      font-size: 25px;
      cursor: pointer;
    }
  }
  .plugin-bar-search {
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
