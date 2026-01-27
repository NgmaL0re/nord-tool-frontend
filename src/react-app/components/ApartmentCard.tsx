import { Edit2, Trash2, Calendar, Clock, Home, ClipboardCheck } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Apartamento } from "@/shared/types";

interface ApartmentCardProps {
  apartment: Apartamento;
  onEdit: (apartment: Apartamento) => void;
  onDelete: (id: number) => void;
}

export default function ApartmentCard({ apartment, onEdit, onDelete }: ApartmentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "liberado":
        return "from-blue-500 to-blue-600";
      case "aprovado":
        return "from-green-500 to-green-600";
      case "reprovado":
        return "from-red-500 to-red-600";
      case "pendente":
        return "from-yellow-500 to-yellow-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  // Use vistoria_data if available, otherwise use data
  const displayDate = apartment.vistoria_data || apartment.data;
  const displayDiaSemana = apartment.vistoria_data 
    ? format(new Date(apartment.vistoria_data + 'T00:00:00'), "EEEE", { locale: ptBR }).charAt(0).toUpperCase() + format(new Date(apartment.vistoria_data + 'T00:00:00'), "EEEE", { locale: ptBR }).slice(1)
    : apartment.dia_semana;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Header com status */}
      <div className={`bg-gradient-to-r ${getStatusColor(apartment.status)} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Home className="w-5 h-5" />
            <h3 className="text-lg font-bold">{apartment.apartamento}</h3>
          </div>
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white uppercase">
            {apartment.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3 text-slate-700">
          <Calendar className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-xs text-slate-500">Data e Dia</p>
            <p className="font-semibold">
              {displayDiaSemana} - {format(new Date(displayDate + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-700">
          <Clock className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-xs text-slate-500">Horário</p>
            <p className="font-semibold">{apartment.horario}</p>
          </div>
        </div>

        {apartment.vistoria_data && (
          <div className="flex items-center gap-3 text-slate-700 bg-blue-50 p-3 rounded-lg">
            <ClipboardCheck className="w-5 h-5 text-blue-500" />
            <div className="flex-1">
              <p className="text-xs text-slate-500 mb-1">Revistoria</p>
              <p className="text-sm font-medium text-slate-700">
                {apartment.vistoria || "Revistoria marcada"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Data original: {format(new Date(apartment.data + 'T00:00:00'), "dd/MM/yyyy")}
              </p>
            </div>
          </div>
        )}

        {apartment.observacao && (
          <div className="border-t pt-4">
            <p className="text-xs text-slate-500 mb-1">Observação</p>
            <p className="text-sm text-slate-700">{apartment.observacao}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-slate-50 flex gap-2">
        <button
          onClick={() => onEdit(apartment)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          <span className="text-sm font-medium">Editar</span>
        </button>
        <button
          onClick={() => onDelete(apartment.id)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-sm font-medium">Excluir</span>
        </button>
      </div>
    </div>
  );
}
