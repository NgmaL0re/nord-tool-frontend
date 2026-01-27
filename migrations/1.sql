
CREATE TABLE apartamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dia_semana TEXT NOT NULL,
  data DATE NOT NULL,
  horario TEXT NOT NULL,
  apartamento TEXT NOT NULL,
  vistoria TEXT,
  status TEXT NOT NULL,
  observacao TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_apartamentos_data ON apartamentos(data);
CREATE INDEX idx_apartamentos_status ON apartamentos(status);
