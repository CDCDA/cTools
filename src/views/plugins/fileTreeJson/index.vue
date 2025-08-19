<template>
  <div class="page-main">
    <div class="file-select">
      <el-input v-model="targetPath">
        <template #prepend><span style="cursor: pointer" @click="selectFile">选择文件夹</span></template>
        <template #append><span style="cursor: pointer" @click="handleCopy">复制json</span></template>
      </el-input>
    </div>
    <div class="file-option">
      <el-input class="file-option-item" v-model="excludeFiles" placeholder="请输入排除文件,例如:.git,node_modules" />      
      <el-input-number class="file-option-item" v-model="maxDepth" placeholder="深度,默认10,0表示不限制" />    
    </div>
    <div class="file-json">
      <Editor ref="jsonEditorRef" v-model="fileJson" language="json" v-loading="loading" />    
    </div>
    <div class="tools">
      <el-button type="text" @click="handleCharTree">字符树</el-button>      
      <el-button type="text" @click="handleJsonTree">json树</el-button>      
      <el-button type="text" @click="handleFormat">格式化</el-button>      
      <div class="time">耗时：{{ (consumingTime / 1000).toFixed(2) }}s</div>      
      <div class="count">字符数：{{ fileJson.length }}</div>    
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { BaseDirectory } from "@tauri-apps/api/path";

import { invoke } from "@tauri-apps/api/core";
import Editor from "@/components/editor/index.vue";
import { message } from "@tauri-apps/plugin-dialog";
import { fsApi } from "@/utils/file";
import { ElMessage } from "element-plus";
const fileJson = ref("");
const tempFileJson = ref("");
const jsonEditorRef = ref(null);
const targetPath = ref("");
const loading = ref(false);
const consumingTime = ref(0);
const excludeFiles = ref(".git,node_modules,target");
const maxDepth = ref(10);
const selectFile = async () => {
  const selectPath = await fsApi.openFileDialog({ directory: true });
  if (!selectPath) {
    ElMessage.error("未获取到文件夹");
    return;
  }
  targetPath.value = selectPath;
  loading.value = true;
  const startTime = new Date().getTime();
  
  const files = await invoke("list_directory_recursively_jwalk", {
    path: selectPath,
    excludeFiles: excludeFiles.value, // 修改为驼峰命名以匹配后端期望
    maxDepth: maxDepth.value,
  });
  fileJson.value = JSON.stringify(files);
  nextTick(() => {
    jsonEditorRef.value.formatContent();
    loading.value = false;
    const endTime = new Date().getTime();
    consumingTime.value = endTime - startTime;
  });
};

const processFile = async (filePath) => {};

const handleCopy = async () => {
  const text = fileJson.value;
  try {
    await navigator.clipboard.writeText(text);
    ElNotification({
      message: "复制成功",
      type: "success",
    });
  } catch (err) {
    console.error("复制失败:", err);
    message("复制失败，请重试", { title: "错误", type: "error" });
  }
};

const handleFormat = () => {
  jsonEditorRef.value?.formatContent();
};

const handleCharTree = () => {
  tempFileJson.value = JSON.parse(JSON.stringify(fileJson.value));
  const charTree = JSON.parse(fileJson.value);
  fileJson.value = jsonToTreeString(charTree);
};

const handleJsonTree = () => {
  fileJson.value = tempFileJson.value;
  nextTick(() => {
    jsonEditorRef.value.formatContent();
  });
};

interface FileNode {
  name: string;
  path: string;
  is_file: boolean;
  children: FileNode[];
}

const jsonToTreeString = (nodes: FileNode[], rootName?: string): string => {
  let output = rootName ? `${rootName}/\n` : "";
  const buildNodeString = (node: FileNode, prefix: string, isLast: boolean): string => {
    let line = prefix;
    line += isLast ? "└── " : "├── ";
    line += node.name;
    if (!node.is_file) {
      line += "/"; // 为目录添加斜杠
    }
    line += "\n";

    const newPrefix = prefix + (isLast ? "    " : "│   ");

    // 3. 递归处理所有子节点
    if (node.children && node.children.length > 0) {
      node.children.forEach((child, index) => {
        const isLastChild = index === node.children.length - 1;
        line += buildNodeString(child, newPrefix, isLastChild);
      });
    }

    return line;
  };

  // 4. 遍历所有顶级节点，开始构建过程
  nodes.forEach((node, index) => {
    const isLastNode = index === nodes.length - 1;
    // 顶级节点的前缀为空
    output += buildNodeString(node, "", isLastNode);
  });

  return output;
};

onMounted(async () => {});
</script>

<style lang="scss" scoped>
.page-main {
  padding-bottom: 0;
  height: calc(100% - 20px);
}
.file-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .file-path {
    flex: 1;
    height: 100%;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    color: #333;
    background: white;
    margin: 0 5px;
  }
  margin-bottom: 10px;
}
.file-option {
  display: flex;
  margin-bottom: 10px;
  .file-option-item:nth-child(1) {
    margin-right: 10px;
  }
}
.file-json {
  flex: 1;
  min-height: 0;
}
.tools {
  width: 100%;
  display: flex;
  justify-content: end;
  align-items: center;
  .count,
  .time {
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 0px 9px 15px;
  }
}
</style>
