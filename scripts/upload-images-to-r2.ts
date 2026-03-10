import { config } from "dotenv";
import { readdir, readFile } from "fs/promises";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

config({ path: ".env.local" });

const endpoint = process.env.R2_ENDPOINT;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET_NAME;

if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
  console.error("Missing R2 environment variables. Set R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME");
  process.exit(1);
}

const client = new S3Client({
  region: "auto",
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
});

const PLAYERS_DIR = path.join(process.cwd(), "private", "players");

async function uploadAll() {
  const seasons = await readdir(PLAYERS_DIR);

  let uploaded = 0;
  let failed = 0;

  for (const season of seasons) {
    const seasonDir = path.join(PLAYERS_DIR, season);
    const files = await readdir(seasonDir);

    for (const file of files) {
      if (!file.endsWith(".png")) continue;

      const filePath = path.join(seasonDir, file);
      const key = `players/${season}/${file}`;

      try {
        const body = await readFile(filePath);
        await client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: "image/png",
          })
        );
        console.log(`✓ ${key}`);
        uploaded++;
      } catch (err) {
        console.error(`✗ ${key}:`, err);
        failed++;
      }
    }
  }

  console.log(`\nDone: ${uploaded} uploaded, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

uploadAll();
