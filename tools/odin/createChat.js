// Odin Chat API integration
export async function createChat(projectId, message) {
  const response = await fetch("https://api.getodin.ai/chat", {
    method: "POST",
    headers: {
      "X-Api-Key": process.env.ODIN_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      project_id: projectId,
      message
    })
  });

  if (!response.ok) {
    throw new Error(`Odin Chat error: ${response.status}`);
  }

  return await response.json();
}
