export async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/parse-file", { method: "POST", body: form });
  const body = await res.json() as { text?: string; error?: string };

  if (!res.ok) {
    throw new Error(body.error ?? `Upload failed (HTTP ${res.status})`);
  }

  return body.text ?? "";
}
