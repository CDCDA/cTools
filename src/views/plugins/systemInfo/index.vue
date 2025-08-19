<template>
  <div class="page-main system-info" v-loading="loading">
    <div class="system-info-wrap">
      <div class="system-info-first">
        <div class="system-details">
          <div class="system-details-item">
            <span class="label">操作系统</span>
            <span class="value">{{ `${system.name || ""} ${system.version || ""}` }}</span>
          </div>
          <div class="system-details-item">
            <span class="label">内存</span>
            <span class="value">{{
              `${formatBytesToGB(system.available_memory || 0)} / ${formatBytesToGB(system.total_memory || 0)}`
            }}</span>
          </div>
          <div class="system-details-item">
            <span class="label">交换空间</span>
            <span class="value">{{
              `${formatBytesToGB(system.used_swap || 0)} / ${formatBytesToGB(system.total_swap || 0)}`
            }}</span>
          </div>
        </div>
        <div class="disks">
          <div class="disks-item" v-for="item in disks" :key="item.name">
            <div class="disks-item-img">
              <svg-icon iconName="otherSvg-disk" />
            </div>
            <div class="disks-item-info">
              <div class="disks-subItem">
                <span class="label">磁盘名</span>
                <span class="value">{{ item.name }}</span>
              </div>
              <div class="disks-subItem">
                <span class="label">总内存</span>
                <span class="value">{{ formatBytesToGB(item.total) }}</span>
              </div>
              <div class="disks-subItem">
                <span class="label">已用内存</span>
                <span class="value">{{ formatBytesToGB(item.used) }}</span>
              </div>
              <div class="disks-subItem">
                <span class="label">可用内存</span>
                <span class="value">{{ formatBytesToGB(item.available) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="system-info-second">
        <div class="memory">
          <BaseChart :options="memoryOptions" />
        </div>
        <div class="cpu">
          <div class="cpu-item" v-for="cpuItem in cpus">
            <div class="cpu-item-icon">
              <svg-icon iconName="otherSvg-cpu" />
            </div>
            <div class="cpu-item-info">
              <div class="cpu-item-top">
                <span class="label"></span>
                <span class="value">{{ cpuItem.usage.toFixed(2) }}%</span>
              </div>
              <div class="cpu-item-bottom">
                <span class="label"></span>
                <span class="value">{{ cpuItem.frequency }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, toRefs, reactive } from "vue";
import Editor from "@/components/editor/index.vue";
import { invoke } from "@tauri-apps/api/core";
import { ElMessage } from "element-plus";
import BaseChart from "@/components/charts/baseChart.vue";
import { formatBytesToGB } from "@/utils/formatters";
const loading = ref(true);
const systemInfo = reactive({
  system: {},
  cpus: [],
  memory: {},
  disks: [],
});
const { system, cpus, memory, disks } = toRefs(systemInfo);
const memoryList = ref([]);
const memoryTimeList = ref([]);
const memoryOptions = reactive({
  grid: {
    left: "5%",
    right: "10%",
    bottom: "5%",
    top: "12%",
    containLabel: true,
  },
  xAxis: {
    name: "时间",
    type: "category",
    data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  yAxis: {
    name: "可用内存/GB",
    type: "value",
  },
  series: [
    {
      data: [150, 230, 224, 218, 135, 147, 260],
      type: "line",
    },
  ],
});

const initData = async () => {
  try {
    const apiData = await invoke("get_system_info");
    // 正确映射API响应数据
    systemInfo.system = apiData.system || apiData;
    systemInfo.cpus = apiData.cpus || [];
    systemInfo.memory = apiData.memory || null;
    systemInfo.disks = apiData.disks || [];
    if (memoryList.value.length > 12) {
      memoryList.value.shift();
      memoryTimeList.value.shift();
    }
    memoryList.value.push(formatBytesToGB(apiData.memory.used).replace("GB", ""));
    memoryTimeList.value.push(new Date().toLocaleTimeString());
    memoryOptions.series[0].data = memoryList.value;
    memoryOptions.xAxis.data = memoryTimeList.value;
    loading.value = false;
    // console.log("系统信息获取成功:", systemInfo);
  } catch (error) {
    console.error("系统信息获取失败:", error);
    ElMessage.error(`获取系统信息失败: ${error.message}`);
  }
};
onMounted(async () => {
  setInterval(async () => {
    initData();
  }, 3000);
});
</script>

<style lang="scss" scoped>
.system-info-wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
  .system-info-first {
    height: 25%;
    margin-bottom: 10px;
    display: flex;
    .system-details {
      width: calc(28% - 20px);
      height: calc(100% - 20px);
      margin-right: 10px;
      box-shadow: 1px 1px 3px rgb(163, 163, 163);
      background: white;
      border-radius: 6px;
      padding: 10px 15px;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      .system-details-item {
        display: flex;
        .value {
          font-size: 13px;
        }
        .label {
          font-size: 14px;
          font-weight: bold;
          width: 65px;
          display: block;
        }
      }
    }
    .disks {
      width: calc(72% - 10px);
      height: 100%;
      box-shadow: 1px 1px 3px rgb(163, 163, 163);
      background: white;
      border-radius: 6px;
      display: flex;
      .disks-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex: 1;
        border-right: 1px solid #ccc;
        padding: 10px;
        .disks-item-img {
          width: 60px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          .svg-icon {
            width: 50px;
            height: 50px;
          }
        }
        .disks-item-info {
          width: calc(100% - 80px);
          padding-right: 10px;
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;
          height: 100%;
          .disks-subItem {
            display: flex;
            justify-content: space-between;
            align-items: center;
            span {
              display: block;
            }
            .label {
              width: 70px;
              font-size: 14px;
              font-weight: bold;
            }
            .value {
              font-size: 13px;
            }
          }
        }
      }
    }
  }
  .system-info-second {
    height: calc(75% - 10px);
    display: flex;
    .memory {
      width: 70%;
      height: 100%;
      margin-right: 10px;
      box-shadow: 1px 1px 3px rgb(163, 163, 163);
      background: white;
      border-radius: 6px;
    }
    .cpu {
      width: calc(30% - 10px);
      height: 100%;
      box-shadow: 1px 1px 3px rgb(163, 163, 163);
      background: white;
      border-radius: 6px;
      display: flex;
      flex-wrap: wrap;
      border-left: 1px solid #ccc;
      border-top: 1px solid #ccc;
      .cpu-item {
        width: calc(50% - 11px);
        padding: 0 5px;
        display: flex;
        height: calc(12.5% - 1px);
        border-right: 1px solid #ccc;
        border-bottom: 1px solid #ccc;
        .cpu-item-icon {
          width: 40%;
          .svg-icon {
            width: 100%;
            height: 100%;
          }
        }
        .cpu-item-info {
          width: calc(60% - 10px);

          display: flex;
          align-items: center;
          flex-direction: column;
          justify-content: space-evenly;
          .cpu-item-top,
          .cpu-item-bottom {
            width: calc(100% - 10px);
          }
          span {
            display: flex;
            align-items: center;
          }
          .value {
            font-size: 13px;
          }
          .label {
            font-size: 14px;
            font-weight: bold;
            width: 75px;
            display: block;
          }
        }
      }
    }
  }
}
</style>
