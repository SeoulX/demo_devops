import { NextApiRequest, NextApiResponse } from "next";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/dtr/clock_out`, {
      method: "POST",
      headers: { Authorization: authHeader },
    });
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ message: errorData.detail || "Failed to fetch user data" });
    }

    const userData = await response.json();
    res.status(200).json(userData);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}