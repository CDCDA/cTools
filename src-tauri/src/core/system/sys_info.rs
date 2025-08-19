use serde::Serialize;
use sysinfo::{CpuExt, DiskExt, System, SystemExt};

// 系统信息汇总
#[derive(Serialize)]
pub struct SystemInfo {
    system: SystemDetails,
    cpus: Vec<CpuInfo>,
    memory: MemoryInfo,
    disks: Vec<DiskInfo>,
    networks: Vec<NetworkInfo>,
    processes: Vec<ProcessInfo>,
}

// 动态系统信息
#[derive(Serialize)]
pub struct DynamicSystemInfo {
    system: SystemDetails,
    cpus: Vec<CpuInfo>,
    memory: MemoryInfo,
    disks: Vec<DiskInfo>,
}
// 系统详细信息
#[derive(Serialize)]
struct SystemDetails {
    name: String,
    version: String,
    kernel_version: String,
    total_memory: u64,     // bytes
    available_memory: u64, // bytes
    total_swap: u64,       // bytes
    used_swap: u64,        // bytes
}
// CPU信息
#[derive(Serialize)]
struct CpuInfo {
    id: usize,
    usage: f32,     // 百分比 (0.0 ~ 1.0)
    frequency: u64, // MHz
}
// 内存信息
#[derive(Serialize)]
struct MemoryInfo {
    total: u64,     // bytes
    available: u64, // bytes
    used: u64,      // bytes (total - available)
}
// 磁盘信息
#[derive(Serialize)]
struct DiskInfo {
    name: String,
    total: u64,     // bytes
    available: u64, // bytes
    used: u64,      // bytes (total - available)
}
// 网络信息
#[derive(Serialize)]
struct NetworkInfo {
    interface_name: String,
    received: u64, // bytes
    sent: u64,     // bytes
}
// 进程信息
#[derive(Serialize)]
struct ProcessInfo {
    pid: String,
    name: String,
    memory_usage: u64, // bytes
}



#[tauri::command]
pub async fn get_dynamic_system_info() -> DynamicSystemInfo {
    let mut sys = System::new_all();
    sys.refresh_all(); // 刷新所有信息

    // 1. 系统基本信息
    let system = SystemDetails {
        name: sys.name().unwrap_or("未知".to_string()),
        version: sys.os_version().unwrap_or("未知".to_string()),
        kernel_version: sys.kernel_version().unwrap_or("未知".to_string()),
        total_memory: sys.total_memory(),
        available_memory: sys.available_memory(),
        total_swap: sys.total_swap(),
        used_swap: sys.used_swap(),
    };

    // 2. CPU 信息
    let cpus: Vec<CpuInfo> = sys
        .cpus()
        .iter()
        .enumerate()
        .map(|(i, cpu)| CpuInfo {
            id: i,
            usage: cpu.cpu_usage(),
            frequency: cpu.frequency(),
        })
        .collect();

    // 3. 磁盘信息
    let disks: Vec<DiskInfo> = sys
        .disks()
        .iter()
        .map(|disk| DiskInfo {
            name: format!("{:?}", disk.name()),
            used: disk.total_space() - disk.available_space(),
            total: disk.total_space(),
            available: disk.available_space(),
        })
        .collect();

    // 4. 内存信息
    let memory: MemoryInfo = MemoryInfo {
        total: sys.total_memory(),
        available: sys.available_memory(),
        used: sys.used_memory(),
    };

    // 返回整体结构体
    DynamicSystemInfo {
        system,
        cpus,
        disks,
        memory,
    }
}
