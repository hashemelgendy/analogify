/**
 * Verify Supabase env + connection without starting Next.js.
 * Usage: npm run supabase:check
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const raw = readFileSync(filePath, "utf8");
  for (const line of raw.split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url || !anonKey) {
  console.log(
    JSON.stringify(
      {
        ok: false,
        configured: false,
        message:
          "Missing NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

let host;
try {
  host = new URL(url).host;
} catch {
  console.log(
    JSON.stringify(
      {
        ok: false,
        configured: true,
        message: "NEXT_PUBLIC_SUPABASE_URL is not a valid URL",
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

const started = Date.now();

try {
  const healthResponse = await fetch(`${url}/auth/v1/health`, {
    method: "GET",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });

  if (!healthResponse.ok) {
    console.log(
      JSON.stringify(
        {
          ok: false,
          configured: true,
          urlHost: host,
          latencyMs: Date.now() - started,
          message: `Supabase auth health returned HTTP ${healthResponse.status}`,
        },
        null,
        2,
      ),
    );
    process.exit(1);
  }

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await supabase.auth.getSession();

  if (error) {
    console.log(
      JSON.stringify(
        {
          ok: false,
          configured: true,
          urlHost: host,
          latencyMs: Date.now() - started,
          message: error.message,
        },
        null,
        2,
      ),
    );
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        configured: true,
        urlHost: host,
        latencyMs: Date.now() - started,
        message: "Supabase connection verified",
      },
      null,
      2,
    ),
  );
  process.exit(0);
} catch (error) {
  console.log(
    JSON.stringify(
      {
        ok: false,
        configured: true,
        urlHost: host,
        latencyMs: Date.now() - started,
        message: error instanceof Error ? error.message : "Failed to reach Supabase",
      },
      null,
      2,
    ),
  );
  process.exit(1);
}
