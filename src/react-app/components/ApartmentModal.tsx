import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Apartamento } from "@/shared/types";

interface ApartmentModalProps {
  apartment: Apartamento | null;
  onClose: () => void;
  onSave: () => void;
}

export default function ApartmentModal({ apartment, onClose, onSave }: ApartmentModalProps) {
  const [apartmentList, setApartmentList] = useState<string[]>([]);
  const [timeSlotsList, setTimeSlotsList] = useState<string[]>([]);
  const [existingApartments, setExistingApartments] = useState<string[]>([]);
  const [hasVistoria, setHasVistoria] = useState(false);
  const [formData, setFormData] = useState<{
    dia_semana: string;
    data: string;
    horario: string;
    apartamento: string;
    vistoria: string;
    vistoria_data: string;
    status: "agendado" | "liberado" | "aprovado" | "reprovado" | "pendente";
    observacao: string;
  }>({
    dia_semana: "",
    data: "",
    horario: "",
    apartamento: "",
    vistoria: "",
    vistoria_data: "",
    status: "liberado",
    observacao: "",
  });

  useEffect(() => {
    fetchApartmentList();
    fetchTimeSlotsList();
    fetchExistingApartments();
  }, []);

  useEffect(() => {
    if (apartment) {
      setFormData({
        dia_semana: apartment.dia_semana,
        data: apartment.data,
        horario: apartment.horario,
        apartamento: apartment.apartamento,
        vistoria: apartment.vistoria || "",
        vistoria_data: apartment.vistoria_data || "",
        status: apartment.status,
        observacao: apartment.observacao || "",
      });
      setHasVistoria(!!(apartment.vistoria || apartment.vistoria_data));
    }
  }, [apartment]);

  // Auto-fill dia_semana when data changes
  useEffect(() => {
    if (formData.data) {
      const date = new Date(formData.data + 'T00:00:00');
      const diaSemana = format(date, "EEEE", { locale: ptBR });
      const diaCapitalizado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
      setFormData(prev => ({ ...prev, dia_semana: diaCapitalizado }));
    }
  }, [formData.data]);

  const fetchApartmentList = async () => {
    try {
      const response = await fetch("/api/configuracoes/lista_apartamentos");
      const data = await response.json();
      setApartmentList(data.valor.split(",").map((apt: string) => apt.trim()));
    } catch (error) {
      console.error("Erro ao carregar lista de apartamentos:", error);
    }
  };

  const fetchTimeSlotsList = async () => {
    try {
      const response = await fetch("/api/configuracoes/lista_horarios");
      const data = await response.json();
      setTimeSlotsList(data.valor.split(",").map((time: string) => time.trim()));
    } catch (error) {
      console.error("Erro ao carregar lista de horários:", error);
    }
  };

  const fetchExistingApartments = async () => {
    try {
      const response = await fetch("/api/apartamentos");
      const data = await response.json();
      setExistingApartments(data.map((apt: Apartamento) => apt.apartamento));
    } catch (error) {
      console.error("Erro ao carregar apartamentos existentes:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = apartment ? `/api/apartamentos/${apartment.id}` : "/api/apartamentos";
      const method = apartment ? "PUT" : "POST";

      const payload = {
        ...formData,
        vistoria: hasVistoria ? formData.vistoria : "",
        vistoria_data: hasVistoria ? formData.vistoria_data : "",
      };

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      onSave();
    } catch (error) {
      console.error("Erro ao salvar apartamento:", error);
    }
  };

  // Filter out apartments that are already in the database (except when editing)
  const availableApartments = apartmentList.filter(apt => {
    // When editing, show the current apartment
    if (apartment && apt === apartment.apartamento) {
      return true;
    }
    // Otherwise, only show apartments not yet in database
    return !existingApartments.includes(apt);
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">
            {apartment ? "Editar Apartamento" : "Novo Apartamento"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Data *
              </label>
              <input
                type="date"
                required
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Dia da Semana
              </label>
              <input
                type="text"
                value={formData.dia_semana}
                disabled
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Horário *
              </label>
              <select
                required
                value={formData.horario}
                onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione</option>
                {timeSlotsList.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Apartamento *
              </label>
              <select
                required
                value={formData.apartamento}
                onChange={(e) => setFormData({ ...formData, apartamento: e.target.value })}
                disabled={!!apartment}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-600"
              >
                <option value="">Selecione</option>
                {availableApartments.length === 0 && !apartment ? (
                  <option value="" disabled>Todos os apartamentos já foram cadastrados</option>
                ) : (
                  availableApartments.map((apt) => (
                    <option key={apt} value={apt}>
                      {apt}
                    </option>
                  ))
                )}
              </select>
              {!apartment && availableApartments.length === 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  Todos os apartamentos configurados já possuem fichas cadastradas
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="agendado">Agendado</option>
                <option value="liberado">Liberado</option>
                <option value="aprovado">Aprovado</option>
                <option value="reprovado">Reprovado</option>
                <option value="pendente">Pendente</option>
              </select>
            </div>
          </div>

          {/* Vistoria Section */}
          <div className="border-t pt-4">
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={hasVistoria}
                onChange={(e) => setHasVistoria(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-slate-700">Marcar Revistoria</span>
            </label>

            {hasVistoria && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Observação da Revistoria
                  </label>
                  <input
                    type="text"
                    value={formData.vistoria}
                    onChange={(e) => setFormData({ ...formData, vistoria: e.target.value })}
                    placeholder="Ex: Pendência identificada"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Data da Revistoria
                  </label>
                  <input
                    type="date"
                    value={formData.vistoria_data}
                    onChange={(e) => setFormData({ ...formData, vistoria_data: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Observação
            </label>
            <textarea
              value={formData.observacao}
              onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
              placeholder="Observações adicionais"
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg font-medium"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
