use crate::core::file::file_api::{
    list_directory_recursive, list_directory_recursive_jwalk, FileNode,
};
use crate::core::file::file_hash::{calculate_hashes, HashResult};
use anyhow::Result;
use std::path::PathBuf;

// 遍历目录递归获取所有文件路径
#[tauri::command]
pub async fn list_directory_recursively(
    path: String,
    exclude_files: String,
    max_depth: usize,
) -> Result<Vec<FileNode>, String> {
    list_directory_recursive(path, exclude_files, max_depth).map_err(|e| e.to_string())
}

// 遍历目录递归获取所有文件路径-并行
#[tauri::command]
pub async fn list_directory_recursively_jwalk(
    path: String,
    exclude_files: String,
    max_depth: usize,
) -> Result<Vec<FileNode>, String> {
    list_directory_recursive_jwalk(path, exclude_files, max_depth).map_err(|e| e.to_string())
}

// 计算文件哈希值
#[tauri::command]
pub async fn calculate_file_hash(path: PathBuf) -> Result<HashResult, String> {
    calculate_hashes(path).await.map_err(|e| e.to_string())
}
