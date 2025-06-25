"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Department {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export default function SettingsPage() {
  // Departamentos
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState<Department | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  async function fetchDepartments() {
    setLoading(true);
    const { data, error } = await supabase.from("departments").select("*").order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setDepartments(data || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Nome é obrigatório");
      return;
    }
    if (editing) {
      // Update
      const { error } = await supabase
        .from("departments")
        .update({ name, description })
        .eq("id", editing.id);
      if (error) setError(error.message);
      else {
        setEditing(null);
        setName("");
        setDescription("");
        fetchDepartments();
      }
    } else {
      // Insert
      const { error } = await supabase
        .from("departments")
        .insert([{ name, description }]);
      if (error) setError(error.message);
      else {
        setName("");
        setDescription("");
        fetchDepartments();
      }
    }
  }

  async function handleEdit(dep: Department) {
    setEditing(dep);
    setName(dep.name);
    setDescription(dep.description || "");
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja remover este departamento?")) return;
    const { error } = await supabase.from("departments").delete().eq("id", id);
    if (error) setError(error.message);
    else fetchDepartments();
  }

  function handleCancelEdit() {
    setEditing(null);
    setName("");
    setDescription("");
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Departamentos</h2>
        <form onSubmit={handleSubmit} className="mb-6 space-y-2">
          <input
            className="border px-2 py-1 w-full"
            placeholder="Nome do departamento"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <textarea
            className="border px-2 py-1 w-full"
            placeholder="Descrição (opcional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">
              {editing ? "Salvar" : "Adicionar"}
            </button>
            {editing && (
              <button type="button" onClick={handleCancelEdit} className="bg-gray-300 px-4 py-1 rounded">
                Cancelar
              </button>
            )}
          </div>
          {error && <div className="text-red-600">{error}</div>}
        </form>
        {loading ? (
          <div>Carregando...</div>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1 text-left">Nome</th>
                <th className="border px-2 py-1 text-left">Descrição</th>
                <th className="border px-2 py-1">Ações</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(dep => (
                <tr key={dep.id}>
                  <td className="border px-2 py-1">{dep.name}</td>
                  <td className="border px-2 py-1">{dep.description}</td>
                  <td className="border px-2 py-1 text-center">
                    <button onClick={() => handleEdit(dep)} className="text-blue-600 mr-2">Editar</button>
                    <button onClick={() => handleDelete(dep.id)} className="text-red-600">Remover</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      {/* Outras configurações podem ser adicionadas aqui futuramente */}
    </div>
  );
} 