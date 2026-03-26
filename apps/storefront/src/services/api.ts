import { API_BASE_URL } from "@/config/api";

export async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error?.message || "Something went wrong");
  }

  return result.data;
}
