const API_URL = "http://localhost:5000/api"; // Your backend URL

export async function registerUser(name: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) throw new Error((await res.json()).error || "Registration failed");
  return res.json();
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");

  // Store JWT
  localStorage.setItem("token", data.token);
  return data.user;
}

export function getToken() {
  return localStorage.getItem("token");
}

export function logoutUser() {
  localStorage.removeItem("token");
}
