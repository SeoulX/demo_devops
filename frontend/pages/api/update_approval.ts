import { NextApiRequest, NextApiResponse } from "next";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { intern_id, approval } = req.body;

  if (!intern_id || !approval) {
    return res.status(400).json({ message: "Intern ID and approval status are required" });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/interns/update_approval`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intern_id, approval }),
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ message: result.detail || "Failed to update approval" });
    }

    res.status(200).json({ message: "Approval status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}
