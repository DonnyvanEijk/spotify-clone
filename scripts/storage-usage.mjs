/**
 * Report total storage used in Supabase buckets (songs + images by default).
 *
 * Walks each bucket (recursing into any folders) and sums the size of every
 * object from its storage metadata.
 *
 * Usage:
 *   node --env-file=.env scripts/storage-usage.mjs
 *   node --env-file=.env scripts/storage-usage.mjs songs           # one bucket
 *   node --env-file=.env scripts/storage-usage.mjs songs images avatars
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in the env
 * (--env-file=.env loads them).
 */

import { createClient } from "@supabase/supabase-js";

const DEFAULT_BUCKETS = ["songs", "images"];
const PAGE = 1000;

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(2)} ${units[i]}`;
}

async function bucketUsage(supabase, bucket) {
  let totalBytes = 0;
  let fileCount = 0;

  async function walk(prefix) {
    let offset = 0;
    for (;;) {
      const { data, error } = await supabase.storage.from(bucket).list(prefix, {
        limit: PAGE,
        offset,
        sortBy: { column: "name", order: "asc" },
      });
      if (error) throw new Error(error.message);
      if (!data || data.length === 0) break;

      for (const item of data) {
        // Supabase returns folders as entries with id === null.
        if (item.id === null) {
          await walk(prefix ? `${prefix}/${item.name}` : item.name);
        } else {
          totalBytes += item.metadata?.size ?? 0;
          fileCount++;
        }
      }

      if (data.length < PAGE) break;
      offset += PAGE;
    }
  }

  await walk("");
  return { totalBytes, fileCount };
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "❌ Missing env. Run with:  node --env-file=.env scripts/storage-usage.mjs"
    );
    process.exit(1);
  }

  const buckets = process.argv.slice(2).length
    ? process.argv.slice(2)
    : DEFAULT_BUCKETS;

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  let grandBytes = 0;
  let grandFiles = 0;

  console.log("");
  for (const bucket of buckets) {
    try {
      const { totalBytes, fileCount } = await bucketUsage(supabase, bucket);
      grandBytes += totalBytes;
      grandFiles += fileCount;
      console.log(
        `📦 ${bucket.padEnd(10)} ${fileCount.toString().padStart(6)} files   ${fmtBytes(totalBytes)}`
      );
    } catch (err) {
      console.log(`⚠️  ${bucket.padEnd(10)} error: ${err.message}`);
    }
  }

  if (buckets.length > 1) {
    console.log("─".repeat(40));
    console.log(
      `Σ  ${"total".padEnd(10)} ${grandFiles.toString().padStart(6)} files   ${fmtBytes(grandBytes)}`
    );
  }
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
