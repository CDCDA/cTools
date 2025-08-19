// src/composables/useCodeMirror.js
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { bracketMatching, syntaxHighlighting, defaultHighlightStyle, foldGutter, foldKeymap, indentOnInput } from '@codemirror/language';
import { autocompletion, completionKeymap } from '@codemirror/autocomplete';


export function useCodeMirror(props, emit) {
  const editorRef = ref(null);
  const view = ref(null);

  const createOrUpdateEditor = async () => {
    if (editorRef.value) {
      // 销毁旧实例
      view.value?.destroy();

      const extensions = [
        lineNumbers(),
        history(),
        foldGutter(),
        bracketMatching(),
        bracketMatching(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        autocompletion(),
        highlightActiveLine(),
        keymap.of([...defaultKeymap, ...historyKeymap, ...completionKeymap, indentWithTab]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newCode = update.state.doc.toString();
            if (newCode !== props.modelValue) {
              emit('update:modelValue', newCode);
            }
          }
        }),
      ];

      // 动态导入语言
      if (props.language === 'json') {
        const { json } = await import('@codemirror/lang-json');
        extensions.push(json());
      } else if (props.language === 'sql') {
        const { sql, StandardSQL } = await import('@codemirror/lang-sql');
        extensions.push(sql({ dialect: StandardSQL }));
      }

      // 动态导入主题
      if (props.theme === 'dark') {
        const { oneDark } = await import('@codemirror/theme-one-dark');
        extensions.push(oneDark);
      }

      const state = EditorState.create({
        doc: props.modelValue,
        extensions,
      });

      view.value = new EditorView({
        state,
        parent: editorRef.value,
      });
    }
  };

  onMounted(createOrUpdateEditor);
  onUnmounted(() => view.value?.destroy());

  watch([() => props.language, () => props.theme], createOrUpdateEditor);

  watch(() => props.modelValue, (newCode) => {
    if (view.value && newCode !== view.value.state.doc.toString()) {
      view.value.dispatch({
        changes: { from: 0, to: view.value.state.doc.length, insert: newCode },
      });
    }
  });

  return { editorRef, view };
}