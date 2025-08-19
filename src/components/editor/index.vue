<template>
  <div class="code-editor-wrapper">
    <div class="code-editor" ref="editorRef"></div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useCodeMirror } from "./useCodeMirror"; // 确保路径正确
import { format } from "sql-formatter";

const props = defineProps({
  modelValue: { type: String, default: "" },
  language: { type: String, default: "json" },
  theme: { type: String, default: "light" },
});
const emit = defineEmits(["update:modelValue"]);

const { editorRef, view } = useCodeMirror(props, emit);

const formatContent = () => {
  if (!view.value) return;
  const editorState = view.value.state;
  const currentContent = editorState.doc.toString();
  let formattedContent = currentContent;
  try {
    if (props.language === "json") {
      formattedContent = JSON.stringify(JSON.parse(currentContent), null, 2);
    } else if (props.language === "sql") {
      formattedContent = format(currentContent, { language: "sql" });
    }
  } catch (error) {
    console.error("格式化失败:", error);
    return;
  }

  view.value.dispatch({
    changes: { from: 0, to: editorState.doc.length, insert: formattedContent },
  });
};

defineExpose({
  formatContent,
});
</script>

<style lang="scss" scoped>
.code-editor-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: auto;
  border: 1px solid #ddd;
  text-align: left;
  background: white;
  border-radius: 6px;
  min-height: 0;
  .code-editor {
    width: fit-content;
  }
}
.cm-editor {
  height: 100%;
  font-size: 14px;
}
</style>
<style lang="scss">
.cm-editor {
  .cm-content,
  .cm-gutterElement,
  .cm-lineNumbers,
  .cm-scroller,
  .code-editor-wrapper {
    font-family: "Consolas", "Monaco", "Andale Mono", "Ubuntu Mono", monospace;
    font-size: 14px; /* 你也可以在这里统一设置字体大小 */
    background: white !important;
  }
  .cm-gutterElement,
  .cm-foldGutter {
    background: white !important;
  }
}
// .cm-foldGutter .cm-gutterElement {
//   margin-top: 0px !important;
// }
</style>
