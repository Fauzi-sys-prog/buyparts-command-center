"use server";

import { redirect } from "next/navigation";

type CatalogRunDecision = "queue" | "cancel";

function getApiBaseUrl() {
  const baseUrl =
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://127.0.0.1:4000";

  return baseUrl.replace(/\/$/, "");
}

async function submitCatalogRunAction(
  runId: string,
  decision: CatalogRunDecision,
  returnPath: string
) {
  try {
    await fetch(
      `${getApiBaseUrl()}/catalog/enrichment-runs/${encodeURIComponent(runId)}/${decision}`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          source: "web"
        }),
        cache: "no-store"
      }
    );
  } finally {
    redirect(returnPath);
  }
}

export async function queueCatalogRunAction(runId: string, returnPath: string) {
  await submitCatalogRunAction(runId, "queue", returnPath);
}

export async function cancelCatalogRunAction(runId: string, returnPath: string) {
  await submitCatalogRunAction(runId, "cancel", returnPath);
}
