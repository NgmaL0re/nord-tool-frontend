import "./DaviJob.css";

const tarefasDaSemana = [
  { dia: "Segunda-feira", tarefa: "Revisar prioridades" },
  { dia: "Terça-feira", tarefa: "Acompanhar demandas" },
  { dia: "Quarta-feira", tarefa: "Atualizar pendências" },
  { dia: "Quinta-feira", tarefa: "Organizar entregas" },
  { dia: "Sexta-feira", tarefa: "Concluir atividades" },
  { dia: "Sábado", tarefa: "Planejar a semana" },
  { dia: "Domingo", tarefa: "Descanso" },
];

function WalkingCat() {
  return (
    <div className="davi-job-cat-track" aria-hidden="true">
      <div className="davi-job-cat">
        <svg viewBox="0 0 92 58" role="presentation">
          <path className="davi-job-cat__tail" d="M70 35c17 3 18-15 9-18" />
          <path
            className="davi-job-cat__body"
            d="M23 23 18 8l14 8a29 29 0 0 1 23 0l14-8-5 15c5 4 8 9 8 16 0 10-11 15-26 15S17 49 17 39c0-7 2-12 6-16Z"
          />
          <path className="davi-job-cat__inner-ear" d="m23 18-2-5 8 5m24 0 8-5-2 5" />
          <path className="davi-job-cat__face" d="M34 31h.1m23 0h.1M43 38c2 2 4 2 6 0" />
          <path className="davi-job-cat__whiskers" d="m36 37-11-3m11 7-11 2m23-6 11-3m-11 7 11 2" />
          <path className="davi-job-cat__legs" d="M30 50v5m11-4v4m13-5v5m9-7v5" />
        </svg>
      </div>
    </div>
  );
}

export default function DaviJobPage() {
  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-slate-800">Davi Job</h1>

      <div className="davi-job-table-stage">
        <WalkingCat />

        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-500">
                    Dia da semana
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-500">
                    Tarefas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tarefasDaSemana.map(({ dia, tarefa }) => (
                  <tr key={dia} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">{dia}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{tarefa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
