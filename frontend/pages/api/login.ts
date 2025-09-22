import { NextApiRequest, NextApiResponse } from "next";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  const requestBody = { email, password };

  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json({ message: result.detail || "Login failed" });
    }
    res.status(200).json({
      access_token: result.access_token,
      token_type: result.token_type,
      role: result.role,
      approval: result.approval,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}
