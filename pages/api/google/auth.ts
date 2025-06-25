import type { NextApiRequest, NextApiResponse } from 'next'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!
const SCOPE = 'https://www.googleapis.com/auth/calendar.events'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPE)}&access_type=offline&prompt=consent`
  res.redirect(url)
} 