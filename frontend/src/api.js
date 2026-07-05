const DEFAULT_BASE_URL = import.meta.env.VITE_N8N_BASE_URL || "n8n-production-37c3.up.railway.app";
const DEFAULT_DASHBOARD_PATH = import.meta.env.VITE_DASHBOARD_WEBHOOK_PATH || "/webhook/dashboard";

export async function getDashboard() {
  const url = `${DEFAULT_BASE_URL.replace(/\/$/, "")}${DEFAULT_DASHBOARD_PATH}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `Failed to load dashboard (${response.status})`);
  }

  return response.json();
}
