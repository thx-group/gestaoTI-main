const { Client } = require('pg');
require('dotenv').config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const connectionString = process.env.POSTGRES_URL;

const createTableSQL = `
create table if not exists departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamp with time zone default now()
);
`;

async function main() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    await client.query(createTableSQL);
    console.log('Tabela departments criada ou já existe!');
  } catch (err) {
    console.error('Erro ao criar tabela:', err);
  } finally {
    await client.end();
  }
}

main(); 