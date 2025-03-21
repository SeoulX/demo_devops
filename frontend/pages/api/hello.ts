import { NextApiRequest, NextApiResponse } from 'next';

interface Data {
  apiUrl: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  res.json({ apiUrl: process.env.NEXT_PUBLIC_API_URL || "Not Set" });
}
