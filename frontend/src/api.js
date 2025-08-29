// src/api.js
export async function uploadResume(formData) {
  const res = await fetch("http://localhost:4000/upload", {
    method: "POST",
    body: formData,
  });

  let data = null;
  try {
    data = await res.json(); // parse once
  } catch {
    const txt = await res.text();
    throw new Error(`Server returned non-JSON: ${txt.slice(0, 200)}`);
  }

  if (!res.ok || data?.error) {
    throw new Error(data?.error || "Upload failed");
  }

  return data;
}
