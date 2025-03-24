import { NextApiRequest, NextApiResponse } from "next";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  console.log(API_BASE_URL)

  const { firstname, surname, email, role, password } = req.body;

  console.log(req.body)

  if (!firstname || !surname || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const requestBody = {
    name: firstname,
    surname,
    email,
    role,
    password
  };

  try {
    const response = await fetch(`${API_BASE_URL}/1.0/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ message: result.detail || "Signup failed" });
    }

    res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}
