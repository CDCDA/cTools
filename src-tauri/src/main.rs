#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod commands;
mod core;
use commands::file_commands::{
    calculate_file_hash, list_directory_recursively, list_directory_recursively_jwalk,
};
use commands::system_commands::get_system_info;
use tauri::Manager;

#[cfg(desktop)]
// mod tray;
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = app
                .get_webview_window("main")
                .expect("no main window")
                .set_focus();
        }))
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            calculate_file_hash,
            get_system_info,
            list_directory_recursively,
            list_directory_recursively_jwalk
        ])
        .run(tauri::generate_context!())
        .expect("运行Tauri应用失败");
}
