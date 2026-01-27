
-- Add vistoria_data column for vistoria date
ALTER TABLE apartamentos ADD COLUMN vistoria_data DATE;

-- Create settings table for apartment list
CREATE TABLE configuracoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chave TEXT NOT NULL UNIQUE,
  valor TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default apartment list
INSERT INTO configuracoes (chave, valor) VALUES ('lista_apartamentos', '101,102,103,201,202,203,301,302,303');
