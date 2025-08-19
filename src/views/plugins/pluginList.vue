<template>
  <div class="plugin-list-container">
    <div class="plugin-wrap" v-if="!searchText">
      <div class="title">最近使用</div>
      <div class="plugin-list recent-used">
        <div class="plugin-item" v-for="plugin in plugins" :key="plugin.id" @click="selectPlugin(plugin)">
          <svg-icon :iconName="plugin.icon" />
          <div class="plugin-item-title">{{ plugin.name }}</div>
        </div>
      </div>
    </div>
    <div class="plugin-wrap" v-if="searchText">
      <div class="title">最佳匹配</div>
      <div class="plugin-list recent-used">
        <div class="plugin-item" v-for="plugin in bestMatchPlugins" :key="plugin.id" @click="selectPlugin(plugin)">
          <svg-icon :iconName="plugin.icon" />
          <div class="plugin-item-title">{{ plugin.name }}</div>
        </div>
      </div>
    </div>
    <div class="plugin-wrap recommend-match" v-if="recommendMatchPlugins.length > 0">
      <div class="title">匹配推荐</div>
      <div class="plugin-list recent-used">
        <div class="plugin-item" v-for="plugin in recommendMatchPlugins" :key="plugin.id" @click="selectPlugin(plugin)">
          <svg-icon :iconName="plugin.icon" />
          <div class="plugin-item-title">{{ plugin.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from "vue";
import { pluginData } from "./plugins.js";
import { adjustWindowSize } from "@/utils/window.ts";
const emit = defineEmits(["pluginShow"]);
const searchText = ref("");
//插件数据
const plugins = ref(pluginData);

// 最佳匹配插件
const bestMatchPlugins = ref([]) as any;

// 匹配插件推荐
const recommendMatchPlugins = ref([]) as any;

// 最近使用插件
// const recentUsedPlugins = ref([]) as any;

const handleSearch = (query: any) => {
  searchText.value = query;
  if (!query) {
    bestMatchPlugins.value = [];
    recommendMatchPlugins.value = [];
    nextTick(() => {
      // 确保在 DOM 更新后调整窗口大小
      adjustWindowSize();
    });
    return;
  }

  // 模拟搜索逻辑
  const lowerQuery = query.toLowerCase();
  bestMatchPlugins.value = plugins.value.filter((plugin) => plugin.name.toLowerCase().includes(lowerQuery));

  // 推荐匹配插件
  recommendMatchPlugins.value = plugins.value.filter((plugin) => !recommendMatchPlugins.value.includes(plugin));
  nextTick(() => {
    // 确保在 DOM 更新后调整窗口大小
    adjustWindowSize();
  });
};

// 选择插件并执行
const selectPlugin = (plugin: any) => {
  // 这里可以添加实际的插件执行逻辑
  emit("pluginShow", plugin);
};

// 生命周期钩子
onMounted(() => {
  // 监听键盘事件
  // document.addEventListener("keydown", (e) => {
  //   if (e.key === "Escape") {
  //     searchQuery.value = "";
  //     selectedIndex.value = -1;
  //   }
  // });
  adjustWindowSize();
});

defineExpose({
  handleSearch,
  selectPlugin,
});
</script>

<style scoped>
.plugin-list-container {
  display: flex;
  flex-direction: column;
  padding: 10px;
  height: fit-content;
  .plugin-wrap {
    .title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
      padding-left: 12px;
    }
    .plugin-list {
      display: flex;
      justify-content: start;
      flex-wrap: wrap;
      min-height: 90px;
    }
  }
  .plugin-item {
    width: 90px;
    height: 90px;
    border-radius: 9px;
    margin: 0;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    transition: all 0.3s linear;
    cursor: pointer;
    .svg-icon {
      font-size: 40px;
      margin-bottom: 8px;
    }
    .plugin-item-title {
      font-size: 15px;
    }
    &:hover,
    &:active {
      background: #ccc;
    }
  }
  .best-match {
    display: flex;
    justify-content: start;
    flex-wrap: wrap;
  }
}
</style>
