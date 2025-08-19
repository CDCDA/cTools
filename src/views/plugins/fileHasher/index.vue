<template>
  <div class="page-main">
    <div ref="dropZone" class="drop-zone" :class="{ 'drag-over': dragOver }">
      <div class="drop-content" @drop.prevent="handleDrop">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
          <path
            d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"
          />
        </svg>
        <p>拖放文件到此处</p>
        <p class="small">或</p>
        <button @click="selectFile">选择文件</button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>正在计算哈希值...</p>
    </div>

    <div v-if="result" class="result-page-main">
      <h2>文件信息</h2>
      <div class="file-info">
        <p><strong>文件名:</strong> {{ result.filename }}</p>
        <p><strong>文件大小:</strong> {{ formatFileSize(result.size) }}</p>
      </div>

      <h2>哈希值</h2>
      <div class="hash-results">
        <div class="hash-item">
          <label>MD5:</label>
          <div class="hash-value">{{ result.md5 }}</div>
        </div>
        <div class="hash-item">
          <label>SHA-1:</label>
          <div class="hash-value">{{ result.sha1 }}</div>
        </div>
        <div class="hash-item">
          <label>SHA-256:</label>
          <div class="hash-value">{{ result.sha256 }}</div>
        </div>
        <div class="hash-item">
          <label>BLAKE3:</label>
          <div class="hash-value">{{ result.blake3 }}</div>
        </div>
      </div>

      <div class="actions">
        <button @click="copyAll">复制所有哈希值</button>
        <button @click="reset">校验新文件</button>
      </div>
    </div>

    <div v-if="error" class="error">
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { message, open } from "@tauri-apps/plugin-dialog";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
const dropZone = ref(null);
const dragOver = ref(false);
const loading = ref(false);
const result = ref(null);
const error = ref(null);

// 备选方法获取文件路径
const getFilePath = async (file) => {
  try {
    // 使用Tauri API获取文件路径
    const { path } = await import("@tauri-apps/api/path");
    return await path.basename(file.name);
  } catch (e) {
    console.error("获取文件路径失败:", e);
    return null;
  }
};

const selectFile = async () => {
  const selected = await open({
    multiple: false,
    filters: [
      {
        name: "Any File",
        extensions: ["*"],
      },
    ],
  });

  if (selected) {
    if (typeof selected === "string") {
      await processFile(selected);
    } else if (selected.path) {
      // 处理FileEntry对象
      await processFile(selected.path);
    }
  }
};

const processFile = async (filePath) => {
  try {
    error.value = null;
    loading.value = true;
    result.value = null;

    console.log("处理文件:", filePath);

    // 调用Rust命令计算哈希值
    result.value = await invoke("calculate_hashes", { filePath });
  } catch (err) {
    console.error("Error:", err);
    error.value = `计算哈希失败: ${err}`;
    message(`计算哈希失败: ${err}`, { title: "错误", type: "error" });
  } finally {
    loading.value = false;
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const copyAll = async () => {
  if (!result.value) return;

  const text = `文件名: ${result.value.filename}
文件大小: ${formatFileSize(result.value.size)}
MD5: ${result.value.md5}
SHA-1: ${result.value.sha1}
SHA-256: ${result.value.sha256}
BLAKE3: ${result.value.blake3}`;

  try {
    await navigator.clipboard.writeText(text);
    message("已复制所有哈希值到剪贴板！", { title: "成功" });
  } catch (err) {
    console.error("复制失败:", err);
    message("复制失败，请重试", { title: "错误", type: "error" });
  }
};
// 添加文件拖拽监听器
let unlistenFileDrop = ref(null);
const dropRef = ref("drop");
const dragenter = ref(false);

onMounted(async () => {
  // getCurrentWebviewWindow().onDragDropEvent(({ payload }) => {
  //   if (!payload) message(`文件无效: ${err}`, { title: "错误", type: "error" });
  //   const { paths } = payload;
  //   if (paths.length > 0) {
  //     console.log("SSS", paths[0]);
  //     processFile(paths[0]);
  //   }
  // });
  unlistenFileDrop.value = await listen("tauri://drag-drop", ({ payload }) => {
    if (payload?.paths.length > 0) {
      processFile(payload.paths[0]);
    }
  });
});

const reset = () => {
  result.value = null;
  error.value = null;
};
</script>

<style scoped>
p {
  text-align: center;
  margin-bottom: 25px;
  color: #95a5a6;
}

.drop-zone {
  border: 3px dashed #3498db;
  height: calc(100% - 40px);
  border-radius: 10px;
  padding: 40px 20px;
  text-align: center;
  background-color: rgba(52, 152, 219, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
}

.drop-zone.drag-over {
  background-color: rgba(52, 152, 219, 0.15);
  border-color: #2ecc71;
}

.drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.drop-content svg {
  fill: #3498db;
  margin-bottom: 10px;
}

button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.2s;
  margin-top: 10px;
}

button:hover {
  background-color: #2980b9;
}

button:first-of-type {
  background-color: #2ecc71;
}

button:first-of-type:hover {
  background-color: #27ae60;
}

.small {
  font-size: 0.9rem;
  color: #95a5a6;
}

.result-page-main {
  margin-top: 30px;
  padding-bottom: 30px;
}

.file-info {
  background-color: #ecf0f1;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 25px;
}

.file-info p {
  text-align: left;
  margin: 10px 0;
}

.hash-results {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.hash-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

label {
  font-weight: bold;
  color: #2c3e50;
}

.hash-value {
  font-family: "Courier New", Courier, monospace;
  background-color: #ecf0f1;
  padding: 10px 15px;
  border-radius: 6px;
  word-break: break-all;
  font-size: 14px;
  line-height: 1.5;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 30px 0;
  gap: 15px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(52, 152, 219, 0.2);
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  color: #721c24;
  text-align: center;
}
</style>
