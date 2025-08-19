use jwalk::{DirEntry, WalkDir};
use serde::Serialize;
use std::path::PathBuf;
use walkdir::{DirEntry as WalkDirEntry, WalkDir as WalkDirNormal};

#[derive(Debug, Serialize)]
pub struct FileNode {
    name: String,
    path: PathBuf,
    is_file: bool,
    children: Vec<FileNode>,
}

impl FileNode {
    fn new(entry: &DirEntry<((), ())>) -> Self {
        let path = entry.path().to_path_buf();
        let name = entry.file_name().to_string_lossy().into_owned();
        let is_file = entry.file_type().is_file();

        FileNode {
            name,
            path,
            is_file,
            children: Vec::new(),
        }
    }
    fn new_normal(entry: &WalkDirEntry) -> Self {
        let path = entry.path().to_path_buf();
        let name = entry.file_name().to_string_lossy().into_owned();
        let is_file = entry.file_type().is_file();

        FileNode {
            name,
            path,
            is_file,
            children: Vec::new(),
        }
    }
}

fn is_not_hidden(entry: &WalkDirEntry) -> bool {
    entry
        .file_name()
        .to_str()
        .map(|s| !s.starts_with('.') && s != "node_modules" && s != "target" && s != ".git")
        .unwrap_or(false)
}

fn is_not_hidden_jwalk(entry: &DirEntry<((), ())>, exclude_files: &Vec<String>) -> bool {
    let mut is_hidden = false;
    if !exclude_files.is_empty() {
        let file_name = entry.file_name().to_string_lossy();
        for exclude_file in exclude_files {
            if file_name.contains(exclude_file) {
                is_hidden = true;
                break;
            }
        }
    }

    entry
        .file_name()
        .to_str()
        .map(|s| !s.starts_with('.') && !is_hidden)
        .unwrap_or(false)
}

#[tauri::command]
pub fn list_directory_recursive(
    _path: String,
    exclude_files: String,
    max_depth: usize,
) -> Result<Vec<FileNode>, String> {
    let root_path = PathBuf::from(_path);
    if !root_path.is_dir() {
        return Err(format!("路径 '{}' 不是一个有效的目录", root_path.display()));
    }
    let walker = WalkDirNormal::new(&root_path)
        .min_depth(1) // 从根目录的子项开始
        .max_depth(max_depth) // 设置一个合理的深度限制
        .sort_by_file_name() // walkdir 帮你排序！
        .into_iter();
    let mut roots = Vec::new();
    // 栈里直接存放节点的索引路径，而不是不安全的引用
    let mut node_path_indices: Vec<usize> = Vec::new();

    for entry_result in walker.filter_entry(is_not_hidden) {
        let entry = match entry_result {
            Ok(e) => e,
            Err(e) => {
                eprintln!("遍历时跳过错误: {}", e);
                continue; // 跳过有问题的条目
            }
        };
        let depth = entry.depth(); // 0 是 root_path 本身，1 是第一级子项

        // 创建新节点
        let node = FileNode::new_normal(&entry);

        // depth 从 1 开始，所以我们要映射到从 0 开始的索引
        let relative_depth = depth - 1;

        // --- 这就是社区通用的、安全的树构建逻辑 ---

        // 1. 回溯：如果当前深度小于索引路径的长度，说明我们已经完成了子树的遍历
        // 需要回退到正确的父节点。
        if relative_depth < node_path_indices.len() {
            node_path_indices.truncate(depth);
        }

        // 2. 找到父节点并添加子节点
        if node_path_indices.is_empty() {
            // 如果索引路径为空，说明这是第一级节点
            roots.push(node);
        } else {
            // 否则，我们需要通过索引路径找到父节点
            let mut parent_node = &mut roots[node_path_indices.get(0).cloned().unwrap_or(0)];

            // 沿着索引路径深入，直到找到直接父节点
            for &index in &node_path_indices[1..] {
                parent_node = &mut parent_node.children[index];
            }
            parent_node.children.push(node);
        }
        // 3. 深入：如果当前节点是目录，记录下它的位置以便后续的子节点可以找到它
        if !entry.file_type().is_file() {
            // 找到刚刚被推入的那个节点的位置索引
            let mut parent_node: &mut FileNode =
                &mut roots[node_path_indices.get(0).cloned().unwrap_or(0)];

            if node_path_indices.len() > 0 {
                for &index in &node_path_indices[1..] {
                    parent_node = &mut parent_node.children[index];
                }
            }
            let new_node_index = if parent_node.children.len() > 0 {
                parent_node.children.len() - 1
            } else {
                0
            };
            node_path_indices.push(new_node_index);
        }
    }
    Ok(roots)
}

pub fn list_directory_recursive_jwalk(
    path: String,
    exclude_files: String,
    max_depth: usize,
) -> Result<Vec<FileNode>, String> {
    let root_path = PathBuf::from(path);
    if !root_path.is_dir() {
        return Err(format!("路径 '{}' 不是一个有效的目录", root_path.display()));
    }
    let mut exclude_vec: Vec<String> = Vec::new();
    if !exclude_files.is_empty() || exclude_files != "" {
        exclude_vec = exclude_files
            .split(',')
            .map(|s| s.to_string())
            .collect::<Vec<String>>();
    }
    eprintln!("排除文件:{:?}", exclude_vec);
    // --- 步骤 1: 并行收集 ---
    let walker = WalkDir::new(&root_path)
        .min_depth(1)
        .max_depth(max_depth)
        // jwalk 没有 sort_by_file_name，我们需要在收集后手动排序
        .skip_hidden(false) // 我们使用自己的过滤逻辑
        .process_read_dir(move |_depth, _path, _read_dir_state, children| {
            // 在这里对每个目录的子项进行过滤和预排序
            // 这比在最后对一个巨大的 Vec 排序要高效得多
            children.retain(|dir_entry_result| {
                dir_entry_result.as_ref().map_or(false, |dir_entry| {
                    is_not_hidden_jwalk(dir_entry, &exclude_vec)
                })
            });
            // 按文件名排序
            children.sort_by(|a, b| {
                a.as_ref()
                    .unwrap()
                    .file_name
                    .cmp(&b.as_ref().unwrap().file_name)
            });
        });

    // .into_iter() 返回一个并行迭代器
    // 我们将所有结果收集到一个 Vec 中
    let entries: Vec<DirEntry<((), ())>> = walker
        .into_iter()
        .filter_map(|e| e.ok()) // 过滤掉错误，只保留 Ok 的 DirEntry
        .collect();

    // --- 步骤 2: 顺序构建 (代码与之前几乎完全一样) ---
    // 此时 `entries` 已经是一个包含了所有文件/目录的有序集合

    eprintln!("并行收集完成，共 {} 个条目，开始构建树...", entries.len());

    let mut roots = Vec::new();
    // 栈里直接存放节点的索引路径，而不是不安全的引用
    let mut node_path_indices: Vec<usize> = Vec::new();

    for entry in entries {
        let depth = entry.depth(); // 0 是 root_path 本身，1 是第一级子项

        // 创建新节点
        let node = FileNode::new(&entry);

        // depth 从 1 开始，所以我们要映射到从 0 开始的索引
        let relative_depth = depth - 1;

        // --- 这就是社区通用的、安全的树构建逻辑 ---

        // 1. 回溯：如果当前深度小于索引路径的长度，说明我们已经完成了子树的遍历
        // 需要回退到正确的父节点。
        if relative_depth < node_path_indices.len() {
            node_path_indices.truncate(depth);
        }

        // 2. 找到父节点并添加子节点
        if node_path_indices.is_empty() {
            // 如果索引路径为空，说明这是第一级节点
            roots.push(node);
        } else {
            // 否则，我们需要通过索引路径找到父节点
            let mut parent_node = &mut roots[node_path_indices.get(0).cloned().unwrap_or(0)];

            // 沿着索引路径深入，直到找到直接父节点
            for &index in &node_path_indices[1..] {
                parent_node = &mut parent_node.children[index];
            }
            parent_node.children.push(node);
        }
        // 3. 深入：如果当前节点是目录，记录下它的位置以便后续的子节点可以找到它
        if !entry.file_type().is_file() {
            // 找到刚刚被推入的那个节点的位置索引
            let mut parent_node: &mut FileNode =
                &mut roots[node_path_indices.get(0).cloned().unwrap_or(0)];

            if node_path_indices.len() > 0 {
                for &index in &node_path_indices[1..] {
                    parent_node = &mut parent_node.children[index];
                }
            }
            let new_node_index = if parent_node.children.len() > 0 {
                parent_node.children.len() - 1
            } else {
                0
            };
            node_path_indices.push(new_node_index);
        }
    }

    Ok(roots)
}
