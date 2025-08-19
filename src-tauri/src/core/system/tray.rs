use tauri::{
    menu::{Menu, MenuItem, Submenu},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, Runtime,
};

pub fn create_tray<R: Runtime>(app: &tauri::AppHandle<R>) -> tauri::Result<()> {
    let quit_i = MenuItem::with_id(app, "quit", "突出", true, None::<&str>)?;
    let show_i = MenuItem::with_id(app, "show", "显示", true, None::<&str>)?;
    let hide_i = MenuItem::with_id(app, "hide", "隐藏", true, None::<&str>)?;
    let edit_i = MenuItem::with_id(app, "edit_file", "编辑", true, None::<&str>)?;
    let new_i = MenuItem::with_id(app, "new_file", "添加", true, None::<&str>)?;
    let a = Submenu::with_id_and_items(app, "File", "文章", true, &[&new_i, &edit_i])?;
    // 分割线
    let menu = Menu::with_items(app, &[&quit_i, &show_i, &hide_i, &a])?;

    let _ = TrayIconBuilder::with_id("tray")
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(move |app, event| match event.id.as_ref() {
            "quit" => {
                app.exit(0);
            }
            "show" => {
                let window = app.get_webview_window("main").unwrap();
                let _ = window.show();
            }
            "hide" => {
                let window = app.get_webview_window("main").unwrap();
                let _ = window.hide();
            }
            "edit_file" => {
                println!("edit_file");
            }
            "new_file" => {
                println!("new_file");
            }
            // Add more events here
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        })
        .build(app);
    Ok(())
}
