import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code as string
  if (!code) return res.status(400).send('Código não informado')

  try {
    const { data } = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    // Salvar tokens em cookie (exemplo simples, ideal usar session/DB)
    const accessToken = (data as any).access_token;
    res.setHeader('Set-Cookie', `google_access_token=${accessToken}; Path=/; HttpOnly`)
    res.redirect('/settings?google=ok')
  } catch (err) {
    res.status(500).json({ error: 'Erro ao trocar código por token', details: err })
  }
} 