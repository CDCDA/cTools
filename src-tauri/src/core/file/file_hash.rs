use anyhow::Result;
use serde::Serialize;
use std::path::PathBuf;

#[derive(Serialize)]
pub struct HashResult {
    md5: String,
    sha1: String,
    sha256: String,
    blake3: String,
    filename: String,
    size: u64,
}

// 计算文件哈希值
#[tauri::command]
pub async fn calculate_hashes(file_path: PathBuf) -> Result<HashResult, String> {
    match compute_file_hashes(&file_path).await {
        Ok(result) => Ok(result),
        Err(e) => Err(format!("计算哈希失败: {}", e)),
    }
}

async fn compute_file_hashes(file_path: &PathBuf) -> Result<HashResult> {
    use sha1::Digest;
    use sha2::Sha256;
    use tokio::fs::File;
    use tokio::io::AsyncReadExt;

    let mut file = File::open(file_path).await?;
    let metadata = file.metadata().await?;
    let file_size = metadata.len();

    let mut hasher_md5 = md5::Context::new();
    let mut hasher_sha1 = sha1::Sha1::new();
    let mut hasher_sha256 = Sha256::new();
    let mut hasher_blake3 = blake3::Hasher::new();

    let mut buffer = [0; 65536]; // 64KB缓冲区

    loop {
        let n = file.read(&mut buffer).await?;
        if n == 0 {
            break;
        }

        let chunk = &buffer[..n];
        hasher_md5.consume(chunk);
        hasher_sha1.update(chunk);
        hasher_sha256.update(chunk);
        hasher_blake3.update(chunk);
    }

    let filename = file_path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("未知文件")
        .to_string();

    Ok(HashResult {
        md5: format!("{:x}", hasher_md5.compute()),
        sha1: format!("{:x}", hasher_sha1.finalize()),
        sha256: format!("{:x}", hasher_sha256.finalize()),
        blake3: hasher_blake3.finalize().to_hex().to_string(),
        filename,
        size: file_size,
    })
}
