<template>
  <div class="home-container" :style="{ height: mode == 'search' ? 'fit-content' : '100vh' }">
    <SearchBar @pluginSearch="handleSearch" v-if="mode == 'search'" />
    <PluginBar v-if="mode == 'plugin'" :plugin="selectPlugin" @pluginSearch="pluginSearch" @pluginClose="pluginClose" />
    <PluginList ref="pluginListRef" v-if="mode == 'search'" @pluginShow="pluginShow" />
    <main class="content-container" v-if="mode !== 'search'">
      <RouterView v-if="mode == 'manage'" />
      <div class="component-container" v-if="mode == 'plugin'">
        <component ref="pluginRef" class="application" :is="component" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import PluginList from "@/views/plugins/pluginList.vue";
import PluginBar from "@/layout/headerBar/pluginBar.vue";
import SearchBar from "@/layout/headerBar/searchBar.vue";
import { setWindowSize, adjustWindowSize } from "@/utils/window.ts";
import { nextTick, ref } from "vue";
import { RouterView } from "vue-router";

// search:查找插件,plugin:运行子插件,manage:管理插件,
const mode = ref("search");
const pluginListRef = ref(null) as any;
const handleSearch = (query: string) => {
  pluginListRef.value?.handleSearch(query);
};

const pluginRef = ref(null) as any;
const pluginSearch = (query: string) => {
  pluginRef.value?.handleSearch(query);
};

const selectPlugin = ref({}) as any;

const pluginShow = (plugin: any) => {
  mode.value = "plugin";
  component.value = plugin.component;
  nextTick(() => {
    setWindowSize();
    selectPlugin.value = plugin;
  });
};

const pluginClose = () => {
  mode.value = "search";
  component.value = null;
  nextTick(() => {
    adjustWindowSize();
  });
};

const component = ref(null);
</script>

<style lang="scss" scoped>
.home-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
.content-container {
  flex: 1;
  overflow: auto;
}
.component-container {
  height: 100%;
}
</style>
