<template>
  <div class="page-main sql">
    <div class="sql-input-wrap">
      <el-input v-model="inputSql" class="sql-input" type="textarea" clearable> </el-input>
    </div>
    <div class="sql-tools">
      <el-select v-model="options.language" class="tool-item" style="width: 150px">
        <el-option v-for="lang in languageList" :key="lang.value" :label="lang.label" :value="lang.value" />
      </el-select>
      <el-checkbox v-model="options.autoCopy" class="tool-item" label="自动复制" />

      <el-button type="success" class="tool-item" @click="parseLogToSQL"> 转化 </el-button>
    </div>
    <div class="sql-output-wrap">
      <Editor class="sql-output" ref="sqlOutputRef" v-model="outputSql" language="sql" :theme="currentTheme" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Editor from "@/components/editor/index.vue";
import { format } from "sql-formatter";
import { ElMessage } from "element-plus";
const language = ref("sql");
const options = ref({
  language: "sql",
  autoCopy: true,
});
const inputSql = ref("");
const outputSql = ref("");
const sqlOutputRef = ref(null);

const languageList = [
  { label: "Standard SQL", value: "sql" },
  { label: "MySQL", value: "mysql" },
  { label: "MariaDB", value: "mariadb" },
  { label: "PostgreSQL", value: "postgresql" },
  { label: "DB2", value: "db2" },
  { label: "PL/SQL", value: "plsql" },
];
async function parseLogToSQL() {
  // 提取SQL语句和参数行
  const lines = inputSql.value.split("\n");
  const sqlLine = lines.find((line) => line.includes("Preparing:"));
  const paramsLine = lines.find((line) => line.includes("Parameters:"));

  if (!sqlLine || !paramsLine) {
    ElMessage.error("无效日志sql");
  }

  // 提取原始SQL（移除前缀）
  const sqlPrefix = "Preparing:";
  const sqlStart = sqlLine.indexOf(sqlPrefix) + sqlPrefix.length;
  let sql = sqlLine.substring(sqlStart).trim();

  // 提取参数（移除前缀）
  const paramsPrefix = "Parameters:";
  const paramsStart = paramsLine.indexOf(paramsPrefix) + paramsPrefix.length;
  const paramsStr = paramsLine.substring(paramsStart).trim();

  // 解析参数列表
  const params = [];
  let buffer = "";
  let inParentheses = false;

  for (let i = 0; i < paramsStr.length; i++) {
    const char = paramsStr[i];

    if (char === "(") {
      inParentheses = true;
    } else if (char === ")") {
      inParentheses = false;
    }

    if (char === "," && !inParentheses) {
      params.push(buffer.trim());
      buffer = "";
    } else {
      buffer += char;
    }
  }
  if (buffer) params.push(buffer.trim());

  // 替换SQL中的占位符
  let paramIndex = 0;
  let resultSQL = "";
  let inStringLiteral = false;
  let escapeNext = false;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];

    // 处理转义字符
    if (escapeNext) {
      resultSQL += char;
      escapeNext = false;
      continue;
    }

    if (char === "\\") {
      escapeNext = true;
      resultSQL += char;
      continue;
    }

    // 处理字符串字面量
    if (char === "'" && !escapeNext) {
      inStringLiteral = !inStringLiteral;
      resultSQL += char;
      continue;
    }

    // 替换问号占位符
    if (char === "?" && !inStringLiteral) {
      if (paramIndex >= params.length) {
        throw new Error(`Not enough parameters for placeholders`);
      }

      const param = params[paramIndex++];
      const typeStart = param.lastIndexOf("(");

      // 提取值和类型
      let value, type;
      if (typeStart !== -1 && param.endsWith(")")) {
        value = param.substring(0, typeStart).trim();
        type = param.substring(typeStart + 1, param.length - 1).trim();
      } else {
        value = param;
        type = "String"; // 默认类型
      }

      // 根据类型格式化值
      if (type.toLowerCase().includes("string")) {
        resultSQL += `'${value.replace(/'/g, "''")}'`; // 转义单引号
      } else if (type.toLowerCase().includes("date") || type.toLowerCase().includes("time")) {
        resultSQL += `'${value}'`; // 日期/时间类型
      } else {
        resultSQL += value; // 数字/布尔等类型
      }
    } else {
      resultSQL += char;
    }
  }

  // 检查未使用的参数
  if (paramIndex < params.length) {
    console.warn(`Warning: ${params.length - paramIndex} unused parameters`);
  }
  try {
    outputSql.value = await format(resultSQL, {
      language: options.value.language,
      indent: "    ", // 4空格缩进
      uppercase: true, // 关键字大写
    });
    // sqlOutputRef.value?.setValue(outputSql.value);
    options.value.autoCopy ? copyResult() : "";
  } catch (err) {
    outputSql.value = "SQL格式化错误: " + err.message;
    ElMessage.error(outputSql.value);
  }
}

const copyResult = async () => {
  if (!outputSql.value) return;
  try {
    await navigator.clipboard.writeText(outputSql.value);
    ElMessage.success("已复制到剪贴板!");
  } catch (err) {
    error.value = "复制失败: " + err.message;
    ElMessage.error(error.value);
  }
};
</script>

<style lang="scss">
.sql-input {
  .el-textarea__inner {
    min-height: 150px !important;
  }
  margin-bottom: 10px;
}
.sql-output-wrap {
  margin-top: 10px;
  flex: 1;
  min-height: 0;
}
.sql-tools {
  display: flex;
  align-items: center;
  justify-content: end;

  .tool-item {
    margin-left: 15px;
  }
}
.sql-output {
  border-radius: 4px;
  //padding: 10px;
  //box-shadow: 0 0 0 1px #dcdfe6 inset;
}
</style>
