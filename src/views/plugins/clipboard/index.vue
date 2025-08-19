<template>
  <div class="page-main clipboard">
    <div class="clipboard-history">
      <div class="history-list">
        <div v-for="(item, index) in textList" :key="index" class="history-item" @click="handleCopy(item.content)">
          <div class="item-header">
            <div class="timestamp">{{ item.timestamp }}</div>
          </div>
          <div class="content" @dblclick="handleDoubleClick(item.content)">{{ item.content }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Editor from "@/components/editor/index.vue";
import { writeText, readText } from "@tauri-apps/plugin-clipboard-manager";
import { ElMessage } from "element-plus";
import { currentWindow } from "@/utils/window.ts";
import { Command } from "@tauri-apps/plugin-shell";
const jsonStr = ref("");
const jsonEditorRef = ref(null);
const textList = ref([]);

// 格式化时间为 YYYY-MM-DD HH:MM:SS
const formatTime = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
const handleFormat = () => {
  jsonEditorRef.value?.format();
};

const handleDoubleClick = async (content) => {
  try {
    // 复制内容到剪贴板
    await writeText(content);
    // 增加剪贴板更新延迟，确保内容已正确写入
    await new Promise((resolve) => setTimeout(resolve, 300));
    ElMessage({
      message: "内容已复制到剪贴板",
      type: "success",
      duration: 1000,
    });

    // 双重确保焦点切换：先最小化再隐藏窗口
    await currentWindow.minimize();
    await new Promise((resolve) => setTimeout(resolve, 300));
    await currentWindow.hide();

    // 优化等待时间，确保目标窗口获得焦点
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 使用更可靠的粘贴方式，添加详细日志
    try {
      console.log("开始执行粘贴命令...");
      const command = Command.create("powershell", [
        "-ExecutionPolicy",
        "Bypass",
        "-NoProfile",
        "-Command",
        "Start-Sleep -Milliseconds 500; " +
          "try { " +
          "  $wshell = New-Object -ComObject WScript.Shell -ErrorAction Stop; " +
          '  $wshell.SendKeys("^v"); ' +
          '  Write-Host "Paste command executed successfully"; ' +
          "} catch { " +
          '  Write-Error "SendKeys failed: $_"; ' +
          "  exit 1; " +
          "}",
      ]);

      // 使用spawn适应UI交互特性
      await command.spawn();
      console.log("粘贴命令已发送");
    } catch (cmdError) {
      console.error("粘贴命令执行失败:", cmdError);
      // 尝试备选方案 - 直接写入剪贴板并通知用户手动粘贴
      // 显示详细错误信息帮助诊断问题
      const errorMsg = cmdError.message || JSON.stringify(cmdError);
      ElMessage({
        message: `粘贴失败: ${errorMsg}，请手动粘贴 (Ctrl+V)`,
        type: "error",
        duration: 5000,
      });
    }
  } catch (error) {
    ElMessage({
      message: "插入失败，请手动粘贴",
      type: "error",
      duration: 2000,
    });
    console.error("插入失败:", error);
  }
};

const handleCopy = async (content) => {
  try {
    await writeText(content);
    ElMessage({
      message: "复制成功",
      type: "success",
      duration: 1500,
    });
  } catch (error) {
    ElMessage({
      message: "复制失败",
      type: "error",
      duration: 1500,
    });
    console.error("复制失败:", error);
  }
};

let clipboardInterval;
let lastContent = "";

onMounted(async () => {
  // 读取初始剪贴板内容
  const initialContent = await readText();
  if (initialContent) {
    textList.value.push({
      content: initialContent,
      timestamp: formatTime(new Date()),
    });
    lastContent = initialContent;
  }

  // 设置定时轮询剪贴板变化（每1000ms检查一次）
  clipboardInterval = setInterval(async () => {
    try {
      const currentContent = await readText();
      if (currentContent && currentContent !== lastContent && !textList.value.includes(currentContent)) {
        textList.value.unshift({
          content: currentContent,
          timestamp: formatTime(new Date()),
        });
        if (textList.value.length > 10) {
          textList.value.pop();
        }
        lastContent = currentContent;
      }
    } catch (error) {
      console.error("读取剪贴板失败:", error);
    }
  }, 1000);
});

onUnmounted(() => {
  // 清除定时器
  if (clipboardInterval) {
    clearInterval(clipboardInterval);
  }
});
</script>

<style lang="scss" scoped>
.page-main.clipboard {
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
}

.clipboard-history {
  background-color: #f5f5f5;
  border-radius: 8px;
  height: 100%;
}

.history-list {
  overflow-y: auto;
  height: 100%;
}

.history-item {
  padding: 8px 12px;
  margin-bottom: 8px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  word-break: break-all;
  cursor: pointer;
}

.timestamp {
  color: #888;
  font-size: 15px;
  margin-bottom: 4px;
  font-family: monospace;
}

.content {
  margin-top: 4px;
}

.json-editor {
  border-radius: 4px;
  height: calc(100% - 300px);
  min-height: 200px;
}

.tools {
  width: 100%;
  display: flex;
  justify-content: end;
  align-items: center;
  margin-top: 15px;
}
</style>
