<!--
 * @Description:基础图
-->
<template>
  <div class="base-chart" :id="id"></div>
</template>
<script setup lang="ts">
import * as echarts from "echarts";
import { onMounted, watch } from "vue";

const id = Math.random().toString(36).slice(-8);
const props = defineProps({
  options: null,
});

watch(
  () => props.options,
  (val) => {
    val ? init() : "";
  },
  {
    deep: true,
  }
);
function init(options?: any) {
  // 基于准备好的dom，初始化echarts实例
  let myChart = echarts.init(document.getElementById(id) as any);
  if (options) {
    console.log("CCC", options);
  }
  // 绘制图表
  myChart.setOption(options || props.options);
}

defineExpose({ init });

onMounted(() => {});
</script>
<style lang="scss">
.base-chart {
  width: 100%;
  height: 100%;
  // margin-left: 30px;
  // position: absolute;
}
</style>
