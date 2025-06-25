"use client"
import { useState } from "react"

export function GoogleCalendarButton() {
  const [showForm, setShowForm] = useState(false)
  const [summary, setSummary] = useState("")
  const [description, setDescription] = useState("")
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function checkAuthAndOpen() {
    // Tenta acessar um endpoint protegido para ver se está autenticado
    const res = await fetch("/api/google/calendar", { method: "POST", body: JSON.stringify({ test: true }), headers: { "Content-Type": "application/json" } })
    if (res.status === 401) {
      window.location.href = "/api/google/auth"
    } else {
      setShowForm(true)
    }
  }

  async function handleSubmit(e: any) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    const res = await fetch("/api/google/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary, description, start, end })
    })
    const data = await res.json()
    if (res.ok) setResult("Evento criado com sucesso!")
    else setResult(data.error || "Erro ao criar evento")
    setLoading(false)
  }

  return (
    <div>
      <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={checkAuthAndOpen}>
        Agendar no Google Calendar
      </button>
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-2 bg-gray-50 p-4 rounded">
          <input className="border px-2 py-1 w-full" placeholder="Título" value={summary} onChange={e => setSummary(e.target.value)} required />
          <input className="border px-2 py-1 w-full" placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} />
          <input className="border px-2 py-1 w-full" type="datetime-local" value={start} onChange={e => setStart(e.target.value)} required />
          <input className="border px-2 py-1 w-full" type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} required />
          <button className="bg-blue-600 text-white px-4 py-1 rounded" type="submit" disabled={loading}>{loading ? "Agendando..." : "Criar Evento"}</button>
          {result && <div className="mt-2 text-sm">{result}</div>}
        </form>
      )}
    </div>
  )
} 