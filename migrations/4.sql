
INSERT INTO configuracoes (chave, valor, created_at, updated_at)
SELECT 'lista_horarios', '08:00,09:00,10:00,11:00,12:00,13:00,14:00,15:00,16:00,17:00,18:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM configuracoes WHERE chave = 'lista_horarios');
