use crate::core::system::sys_info::{get_dynamic_system_info, DynamicSystemInfo};

// 获取系统信息
#[tauri::command]
pub async fn get_system_info() -> DynamicSystemInfo {
    get_dynamic_system_info().await
}
