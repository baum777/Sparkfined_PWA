/**
 * S3 Storage Utility
 * Persists raw aggregates to S3 for cheap long-term storage and audit trail
 *
 * Fallback: If S3 unavailable, write to local filesystem
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    const region = process.env.AWS_REGION || 'us-east-1';
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials not configured');
    }

    s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });
  }

  return s3Client;
}

/**
 * Persist payload to S3
 *
 * @param payload - Aggregated payload
 * @param key - S3 key (path)
 * @returns S3 URL
 */
export async function persistToS3(
  payload: any,
  key: string
): Promise<string> {
  const bucket = process.env.S3_ANALYTICS_BUCKET;

  if (!bucket) {
    console.warn('[S3] Bucket not configured, falling back to local storage');
    return persistToLocal(payload, key);
  }

  try {
    const client = getS3Client();

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify(payload),
      ContentType: 'application/json',
      ServerSideEncryption: 'AES256'
    });

    await client.send(command);

    const url = `s3://${bucket}/${key}`;
    console.log(`[S3] Persisted: ${url}`);

    return url;
  } catch (error) {
    console.error('[S3] Failed to persist, falling back to local', error);
    return persistToLocal(payload, key);
  }
}

/**
 * Fallback: Persist to local filesystem
 * Used when S3 is unavailable or not configured
 */
async function persistToLocal(payload: any, key: string): Promise<string> {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');

    const localDir = path.join(process.cwd(), 'logs', 'analytics-raw');
    const localPath = path.join(localDir, key);

    // Ensure directory exists
    await fs.mkdir(path.dirname(localPath), { recursive: true });

    // Write file
    await fs.writeFile(localPath, JSON.stringify(payload, null, 2), 'utf-8');

    console.log(`[Storage] Persisted locally: ${localPath}`);
    return `file://${localPath}`;
  } catch (error) {
    console.error('[Storage] Failed to persist locally', error);
    throw error;
  }
}
