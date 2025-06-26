

export async function getUsers() {
  const response = await fetch("/api/user");
  const users = await response.json();
  return users;
}
