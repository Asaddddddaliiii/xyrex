export default function handler(req: any, res: any) {
  return res.status(200).json({
    key: process.env.GEMINI_API_KEY ? "FOUND" : "MISSING"
  });
}