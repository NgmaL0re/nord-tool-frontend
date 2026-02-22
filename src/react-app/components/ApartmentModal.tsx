import { useEffect, useState } from "react";
import { apartamentoVistoriaService } from "@/react-app/services/ApartamentoVistoriaService";
import { X } from "lucide-react";

import type {
  ApartamentoVistoriaDto,
  ApartamentoVistoriaForm,
  DiaSemanaDto,
  StatusVistoriaDto,
} from "@/shared/types";

import {
  listarDiasSemana,
  listarStatusVistoria,
} from "@/react-app/services/EndpointsDominioService";

interface ApartmentModalProps {
  apartment: ApartamentoVistoriaDto | null;
  onClose: () => void;
  onSave: (data: ApartamentoVistoriaForm) => void;
}

export default function ApartmentModal({
  apartment,
  onClose,
  onSave,
}: ApartmentModalProps) {
  const [diasSemana, setDiasSemana] = useState<DiaSemanaDto[]>([]);
  const [statusList, setStatusList] = useState<StatusVistoriaDto[]>([]);

  const [formData, setFormData] = useState<ApartamentoVistoriaForm>({
    nmApartamentoVistoria: "",
    idDiaSemana: 0,
    dtApartamentoVigente: "",
    nmHorarioVistoria: "",
    idStatusVistoria: 0,
    inMarcarRevistoria: false,
    txObservacaoRevistoria: "",
    dtRevistoriaVigente: "",
  });

  /* =========================
      LOAD DOMÍNIOS (COMBOS)
  ========================= */
  useEffect(() => {
    // Carregamos as listas de referência e garantimos que o erro 404 não quebre o componente
    Promise.all([
      listarDiasSemana().catch(() => []), 
      listarStatusVistoria().catch(() => [])
    ]).then(([dias, status]) => {
      setDiasSemana(dias);
      setStatusList(status);
    });
  }, []);

  /* =========================
      LOAD APARTMENT (EDIT) 
  ========================= */
  useEffect(() => {
    if (apartment) {
      // FIX DATA: Tradução de data para o formato que o input type="date" exige (YYYY-MM-DD)
      let dataISO = apartment.dtApartamentoVigente ?? "";
      
      if (dataISO.includes('/')) {
        const [d, m, a] = dataISO.split('/');
        dataISO = `${a}-${m}-${d}`;
      } else if (dataISO.includes('T')) {
        dataISO = dataISO.split('T')[0];
      }

      setFormData({
        idApartamentoVistoria: apartment.idApartamentoVistoria,
        nmApartamentoVistoria: apartment.nmApartamentoVistoria ?? "",
        idDiaSemana: Number(apartment.idDiaSemana) || 0,
        dtApartamentoVigente: dataISO,
        nmHorarioVistoria: apartment.nmHorarioVistoria ?? "",
        idStatusVistoria: Number(apartment.idStatusVistoria) || 0,
        inMarcarRevistoria: apartment.inMarcarRevistoria ?? false,
        txObservacaoRevistoria: apartment.txObservacaoRevistoria ?? "",
        dtRevistoriaVigente: apartment.dtRevistoriaVigente ?? "",
      });
    }
  }, [apartment]);

  /* =========================
      LÓGICA DE DIA AUTOMÁTICO
  ========================= */
  const handleDateChange = (novaData: string) => {
    if (!novaData) {
      setFormData(prev => ({ ...prev, dtApartamentoVigente: "", idDiaSemana: 0 }));
      return;
    }

    // Pega o index do dia (0-Dom a 6-Sab) evitando problemas de fuso
    const dataObj = new Date(novaData + 'T00:00:00');
    const diaIndex = dataObj.getDay(); 

    // Mapeamento: Domingo(0) -> ID 7, Segunda(1) -> ID 1...
    // Nick, ajuste aqui se o ID do seu banco for diferente (ex: Seg=2)
    const idSugerido = diaIndex === 0 ? 7 : diaIndex;

    setFormData(prev => ({
      ...prev,
      dtApartamentoVigente: novaData,
      idDiaSemana: idSugerido
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (apartment?.idApartamentoVistoria) {
        await apartamentoVistoriaService.editar(formData);
      } else {
        await apartamentoVistoriaService.criar(formData);
      }
      onSave(formData);
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
        
        <header className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <h3 className="text-xl font-bold tracking-tight">
            {apartment ? "Editar Registro" : "Novo Agendamento"}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Apartamento</label>
            <input
              value={formData.nmApartamentoVistoria}
              onChange={(e) => setFormData({ ...formData, nmApartamentoVistoria: e.target.value })}
              className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Data */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Data</label>
              <input
                type="date"
                value={formData.dtApartamentoVigente}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm"
              />
            </div>

            {/* Dia da Semana Reativo */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Dia da Semana</label>
              <select
                value={formData.idDiaSemana}
                onChange={(e) => setFormData({ ...formData, idDiaSemana: Number(e.target.value) })}
                className="w-full border border-slate-200 p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm"
              >
                <option value={0}>Selecione...</option>
                {diasSemana?.map((d) => (
                  <option key={d.idDiaSemana} value={d.idDiaSemana}>
                    {d.nmDiaSemana}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Horário */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Horário</label>
              <input
                value={formData.nmHorarioVistoria}
                onChange={(e) => setFormData({ ...formData, nmHorarioVistoria: e.target.value })}
                className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm"
              />
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Status</label>
              <select
                value={formData.idStatusVistoria}
                onChange={(e) => setFormData({ ...formData, idStatusVistoria: Number(e.target.value) })}
                className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm"
              >
                <option value={0}>Selecione...</option>
                {statusList?.map((s) => (
                  <option key={s.idStatusVistoria} value={s.idStatusVistoria}>
                    {s.nmStatusVistoria}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Observações</label>
            <textarea
              value={formData.txObservacaoRevistoria || ""}
              onChange={(e) => setFormData({ ...formData, txObservacaoRevistoria: e.target.value })}
              className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none h-24 resize-none shadow-sm"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 border border-slate-200 font-bold text-slate-500 rounded-xl p-3 hover:bg-slate-50 transition-all">
              Cancelar
            </button>
            <button type="submit" className="flex-1 bg-blue-600 text-white font-bold rounded-xl p-3 shadow-lg hover:bg-blue-700 transition-all active:scale-95">
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}