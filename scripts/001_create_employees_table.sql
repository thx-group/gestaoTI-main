CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  cpf VARCHAR(20) UNIQUE,
  department VARCHAR(100),
  position VARCHAR(100),
  hire_date DATE,
  status VARCHAR(50),
  notes TEXT,
  accessories JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
