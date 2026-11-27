import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { fetchTicketsWorkbook } from './api';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function toBase64(bytes: Uint8Array) {
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    result += alphabet[(n >> 18) & 63] + alphabet[(n >> 12) & 63] +
      (i + 1 < bytes.length ? alphabet[(n >> 6) & 63] : '=') +
      (i + 2 < bytes.length ? alphabet[n & 63] : '=');
  }
  return result;
}

export async function exportActivePourTickets() {
  if (!FileSystem.cacheDirectory || !(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available on this device.');
  const { bytes, filename } = await fetchTicketsWorkbook();
  const path = `${FileSystem.cacheDirectory}${filename}`;
  try {
    await FileSystem.writeAsStringAsync(path, toBase64(new Uint8Array(bytes)), { encoding: FileSystem.EncodingType.Base64 });
    await Sharing.shareAsync(path, { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', UTI: 'org.openxmlformats.spreadsheetml.sheet' });
  } finally {
    await FileSystem.deleteAsync(path, { idempotent: true });
  }
}
