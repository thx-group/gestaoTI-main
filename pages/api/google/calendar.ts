import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const accessToken = req.cookies.google_access_token
  if (!accessToken) return res.status(401).json({ error: 'Não autenticado no Google' })

  const { summary, description, start, end } = req.body
  try {
    const { data } = await axios.post('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      summary,
      description,
      start: { dateTime: start },
      end: { dateTime: end },
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    res.status(200).json({ event: data })
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar evento', details: err })
  }
} 