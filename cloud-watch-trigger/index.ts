// CloudWatch Logs イベントからログ内容を取得して出力する Lambda ハンドラー
import { promisify } from 'util';
import { gunzip } from 'zlib';

const gunzipAsync = promisify(gunzip);

export const handler = async (event: any, context: any) => {
  try {
    const payload = Buffer.from(event.awslogs.data, 'base64');
    const decompressed = await gunzipAsync(payload);
    const logData = JSON.parse(decompressed.toString('utf8'));
    console.log('Decoded log data:', JSON.stringify(logData, null, 2));
    // 必要に応じて logData.logEvents などを処理
  } catch (err) {
    console.error('Error decoding log event:', err);
    throw err;
  }
};
