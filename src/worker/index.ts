import { Hono } from "hono";
import { z } from "zod";

// Definição de tipos para o Cloudflare Workers (Bindings)
type Env = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();

// Schema de validação flexível para aceitar dados parciais do Modal ou Planilha
const ApartamentoSchema = z.object({
  // Preprocess garante que se vier vazio ou nulo, o Zod transforme em string ou null sem erro
  dia_semana: z.preprocess((v) => v || "", z.string().nullable().optional()),
  data: z.preprocess((v) => v || "", z.string().nullable().optional()),
  horario: z.preprocess((v) => v || "", z.string().nullable().optional()),
  apartamento: z.string(), // Obrigatório: chave para o ON CONFLICT
  vistoria: z.string().nullable().optional(),
  vistoria_data: z.string().nullable().optional(),
  status: z.preprocess(
    (v) => {
      if (v === undefined || v === null || (typeof v === "string" && v.trim() === "")) {
        return "nao_liberado";
      }
      return v;
    },
    z.enum(["nao_liberado", "agendado", "liberado", "aprovado", "reprovado", "pendente"])
  ),
  observacao: z.string().nullable().optional(),
});

const ConfiguracaoSchema = z.object({
  chave: z.string(),
  valor: z.string(),
});

// GET /api/apartamentos - Listar todos
app.get("/api/apartamentos", async (c) => {
  const db = c.env.DB;
  const { results } = await db
    .prepare("SELECT * FROM apartamentos ORDER BY data ASC, horario ASC")
    .all();
  return c.json(results);
});

// POST /api/apartamentos/bulk - Lógica de Upsert (Inserir ou Atualizar)
// Esta rota agora atende tanto a importação de planilhas quanto o salvamento do Modal
app.post("/api/apartamentos/bulk", async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();

  // Validação: aceita um único objeto dentro de um array ou vários
  const result = z.array(ApartamentoSchema).safeParse(body);
  if (!result.success) {
    return c.json(
      { error: "Dados inválidos", details: result.error },
      400
    );
  }

  const apartamentos = result.data;
  const statements = apartamentos.map((apt) => {
    return db
      .prepare(
        `
      INSERT INTO apartamentos (
        dia_semana, data, horario, apartamento, vistoria, vistoria_data, status, observacao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(apartamento) 
      DO UPDATE SET 
        dia_semana = excluded.dia_semana,
        data = excluded.data,
        horario = excluded.horario,
        status = excluded.status,
        observacao = excluded.observacao,
        vistoria = excluded.vistoria,
        vistoria_data = excluded.vistoria_data
    `
      )
      .bind(
        apt.dia_semana || null,
        apt.data || null,
        apt.horario || null,
        apt.apartamento,
        apt.vistoria || null,
        apt.vistoria_data || null,
        apt.status,
        apt.observacao || null
      );
  });

  try {
    await db.batch(statements);
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// DELETE /api/apartamentos/:id - Deletar registro
app.delete("/api/apartamentos/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  try {
    const result = await db.prepare("DELETE FROM apartamentos WHERE id = ?").bind(id).run();
    if (!result.success) return c.json({ error: "Erro ao deletar no banco" }, 500);
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// GET /api/dashboard - Estatísticas filtradas
app.get("/api/dashboard", async (c) => {
  const db = c.env.DB;
  const startDate = c.req.query("startDate");
  const endDate = c.req.query("endDate");
  const condo = c.req.query("condo");

  let conditions = [];
  let params: any[] = [];

  if (startDate && endDate) {
    conditions.push("data BETWEEN ? AND ?");
    params.push(startDate, endDate);
  }
  if (condo) {
    conditions.push("apartamento LIKE ?");
    params.push(`${condo}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const statsQuery = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'agendado' THEN 1 ELSE 0 END) as agendados,
      SUM(CASE WHEN status = 'liberado' THEN 1 ELSE 0 END) as liberados,
      SUM(CASE WHEN status = 'aprovado' THEN 1 ELSE 0 END) as aprovados,
      SUM(CASE WHEN status = 'reprovado' THEN 1 ELSE 0 END) as reprovados,
      SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) as pendentes,
      SUM(CASE WHEN status = 'nao_liberado' THEN 1 ELSE 0 END) as nao_liberados
    FROM apartamentos 
    ${whereClause}
  `;

  const { results: statsResults } = await db.prepare(statsQuery).bind(...params).all();
  const stats = (statsResults[0] as any) || {};

  return c.json({
    total: stats.total || 0,
    agendados: stats.agendados || 0,
    liberados: stats.liberados || 0,
    aprovados: stats.aprovados || 0,
    reprovados: stats.reprovados || 0,
    pendentes: stats.pendentes || 0,
    nao_liberados: stats.nao_liberados || 0,
  });
});

// Rotas de Configurações
app.get("/api/configuracoes/:chave", async (c) => {
  const db = c.env.DB;
  const chave = c.req.param("chave");
  const { results } = await db.prepare("SELECT * FROM configuracoes WHERE chave = ?").bind(chave).all();
  
  if (results.length === 0) return c.json({ error: "Configuração não encontrada" }, 404);
  return c.json(results[0]);
});

app.put("/api/configuracoes/:chave", async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();
  const data = ConfiguracaoSchema.parse(body);
  
  const { success } = await db
    .prepare("UPDATE configuracoes SET valor = ?, updated_at = CURRENT_TIMESTAMP WHERE chave = ?")
    .bind(data.valor, c.req.param("chave"))
    .run();

  return success ? c.json({ success: true }) : c.json({ error: "Erro ao atualizar" }, 500);
});

export default app;