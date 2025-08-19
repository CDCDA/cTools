<template>
  <div class="page-main json">
    <Editor class="json-editor" ref="jsonEditorRef" v-model="jsonStr" language="json" :theme="currentTheme" />
    <div class="tools">
      <el-button type="text" @click="handleFormat">格式化</el-button>
      <el-button type="text" @click="handleDuplicateRemoval">数组去重</el-button>
      <el-button type="text">转义</el-button>
      <el-button type="text">去转义</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Editor from "@/components/editor/index.vue";
const jsonStr = ref("");
const jsonEditorRef = ref(null);

const handleFormat = () => {
  jsonEditorRef.value?.formatContent();
};

const handleDuplicateRemoval = () => {
  let value = jsonEditorRef.value?.getValue();
  try {
    value = JSON.parse(value);
  } catch (error) {
    ElMessage.error("请输入正确的数组json格式");
    return;
  }
  if (!Array.isArray(value)) {
    ElMessage.error("请输入正确的数组json格式");
    return;
  }
  // 对象数组去重实现
  const uniqueArray = [];
  const seen = new Set();
  for (const item of value) {
    // 将对象转换为字符串作为唯一标识
    const itemString = JSON.stringify(item);
    if (!seen.has(itemString)) {
      seen.add(itemString);
      uniqueArray.push(item);
    }
  }
  value = uniqueArray;
  jsonEditorRef.value?.setValue(JSON.stringify(value, null, 2));
};
</script>

<style lang="scss" scoped>
.page-main.json {
  padding-bottom: 0;
  height: calc(100% - 20px);
}
.json-editor {
  border-radius: 4px;
  height: calc(100% - 12px);
}
.tools {
  width: 100%;
  display: flex;
  justify-content: end;
  align-items: center;
}
</style>
