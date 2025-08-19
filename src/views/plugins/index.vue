<template>
  <div class="plugin-container">
    <PluginHeader :plugin="plugin" />
    <div class="plugin-main">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import { getPluginByKey } from "./plugins.js";
import PluginHeader from "./components/pluginHeader.vue";
const route = useRoute();

// 获取路由query参数
const queryParams = route.query;
console.log("路由query参数:", queryParams);
const plugin = ref({}) as any;
if (queryParams.key) {
  plugin.value = getPluginByKey(queryParams.key);
  console.log(plugin.value);
}
</script>

<style scoped>
.plugin-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  .plugin-main {
    height: calc(100% - 50px);
  }
}
</style>
