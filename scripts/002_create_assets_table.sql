CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  brand VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'Disponível',
  assigned_to UUID REFERENCES employees(id), -- Chave estrangeira para a tabela employees
  assigned_date DATE,
  location VARCHAR(255),
  purchase_date DATE,
  purchase_value DECIMAL(10, 2),
  supplier VARCHAR(255),
  warranty_months INTEGER,
  description TEXT,
  specifications JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_assets_updated_at
BEFORE UPDATE ON assets
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
