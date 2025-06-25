import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const CLICKUP_LIST_ID = "901304464044"
const CLICKUP_AUTH_TOKEN = "pk_87986690_QM4SP444Y649SC0LWS02EX1RMYE4A5J8"
const CLICKUP_ASSIGNEE = "81971196"

function toUTCTimestampString(dateStr: string) {
  // dateStr: "2025-06-26T11:02"
  // Cria Date interpretando como local, pega timestamp UTC
  return new Date(dateStr).getTime().toString();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end()
  const { summary, description, start, end } = req.body

  const startTimestamp = start ? toUTCTimestampString(start) : undefined;
  const endTimestamp = end ? toUTCTimestampString(end) : undefined;

  try {
    const { data } = await axios.post(
      `https://api.clickup.com/api/v2/list/${CLICKUP_LIST_ID}/task`,
      {
        name: summary || "Manutenção de Equipamento",
        description: description || "",
        assignees: [CLICKUP_ASSIGNEE],
        start_date: startTimestamp,
        due_date: endTimestamp,
        start_date_time: true,
        due_date_time: true,
        status: "to do"
      },
      {
        headers: {
          Authorization: CLICKUP_AUTH_TOKEN,
          "Content-Type": "application/json"
        }
      }
    )
    res.status(200).json({ success: true, data })
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao criar task no ClickUp", details: err?.response?.data || err.message })
  }
} 