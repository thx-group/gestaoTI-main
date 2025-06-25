"use client";
import { useState } from "react";

export function GoogleCalendarQuickAddButton() {
  const [summary, setSummary] = useState("Manutenção de Equipamento");
  const [description, setDescription] = useState("Agendamento de manutenção preventiva.");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  async function createClickUpTask() {
    await fetch("/api/clickup/create-task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary, description, start, end })
    });
  }

  function toGoogleCalendarDate(dt: string) {
    // dt: "2025-06-25T10:00"
    const date = new Date(dt);
    // Retorna no formato YYYYMMDDTHHmmssZ (UTC)
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  }

  function openGoogleCalendar() {
    if (!start || !end) {
      alert("Preencha data e hora de início e fim!");
      return;
    }
    createClickUpTask(); // Cria a task no ClickUp
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      summary
    )}&details=${encodeURIComponent(description)}&dates=${toGoogleCalendarDate(start)}/${toGoogleCalendarDate(end)}`;
    window.open(url, "_blank");
  }

  return (
    <div>
      <input
        className="border px-2 py-1 w-full"
        placeholder="Título"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
      />
      <input
        className="border px-2 py-1 w-full"
        placeholder="Descrição"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        className="border px-2 py-1 w-full"
        type="datetime-local"
        value={start}
        onChange={(e) => setStart(e.target.value)}
      />
      <input
        className="border px-2 py-1 w-full"
        type="datetime-local"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
      />
      <button
        className="bg-green-600 text-white px-4 py-2 rounded mt-2"
        onClick={openGoogleCalendar}
      >
        Agendar no Google Calendar
      </button>
    </div>
  );
} 