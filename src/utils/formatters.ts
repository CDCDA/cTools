/**
 * 将字节数转换为GB单位
 * @param bytes - 字节数
 * @param decimals - 保留小数位数，默认2位
 * @returns 格式化后的GB字符串
 */
export const formatBytesToGB = (bytes: number | null | undefined, decimals: number = 2): string => {
  if (bytes === null || bytes === undefined) return '0 GB';
  const gb = bytes / (1024 ** 3);
  return `${gb.toFixed(decimals)} GB`;
};

/**
 * 将字节数转换为人类可读的单位
 * @param bytes - 字节数
 * @param decimals - 保留小数位数
 * @returns 格式化后的存储容量字符串
 */
export const formatBytes = (bytes: number | null | undefined, decimals: number = 2): string => {
  if (bytes === null || bytes === undefined) return '0 B';
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${value} ${sizes[i]}`;
};