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

function BolinhoCorner() {
  return (
    <div className="bolinho-corner" aria-hidden="true">
      <div className="bolinho-yarn">
        <span className="bolinho-yarn__thread bolinho-yarn__thread--one" />
        <span className="bolinho-yarn__thread bolinho-yarn__thread--two" />
      </div>

      <svg viewBox="0 0 180 132" role="presentation">
        <path className="bolinho-tail" d="M127 91c42 5 42-39 13-38-11 0-18 9-15 18" />
        <ellipse className="bolinho-body" cx="88" cy="91" rx="47" ry="30" />
        <path className="bolinho-head" d="M47 68 42 28l27 18a54 54 0 0 1 39 0l27-18-5 40c9 8 14 18 14 30 0 25-24 39-54 39S36 123 36 98c0-12 5-22 11-30Z" />
        <path className="bolinho-ear" d="m51 45-3-10 18 13m43 0 18-13-3 10" />
        <ellipse className="bolinho-eye" cx="69" cy="77" rx="9" ry="11" />
        <ellipse className="bolinho-eye" cx="108" cy="77" rx="9" ry="11" />
        <circle className="bolinho-pupil" cx="70" cy="79" r="4.4" />
        <circle className="bolinho-pupil" cx="107" cy="79" r="4.4" />
        <circle className="bolinho-eye-shine" cx="72" cy="76" r="1.8" />
        <circle className="bolinho-eye-shine" cx="109" cy="76" r="1.8" />
        <path className="bolinho-nose" d="m87 91 4-3 4 3-4 3Z" />
        <path className="bolinho-mouth" d="M91 94v3m0 0c-3 3-6 3-8 0m8 0c3 3 6 3 8 0" />
        <path className="bolinho-whiskers" d="m78 94-27-6m27 12-28 2m54-8 27-6m-27 12 28 2" />
        <path className="bolinho-paw bolinho-paw--back" d="M54 111c0 13 17 14 21 3" />
        <path className="bolinho-paw bolinho-paw--front" d="M110 109c8 2 16 8 20 15" />
      </svg>
    </div>
  );
}

export default function DaviJobPage() {
  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-slate-800">Davi Job</h1>

      <div className="davi-job-table-stage">
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

      <BolinhoCorner />
    </div>
  );
}
