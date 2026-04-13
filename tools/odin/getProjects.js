// Odin Projects API integration
export async function getProjects() {
  const response = await fetch("https://api.getodin.ai/projects", {
    method: "GET",
    headers: {
      "X-Api-Key": process.env.ODIN_API_KEY,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Odin API error: ${response.status}`);
  }

  return await response.json();
}
