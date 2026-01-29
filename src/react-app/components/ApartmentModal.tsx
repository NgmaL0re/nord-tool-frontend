import { useEffect, useState } from "react";
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
     LOAD COMBOS
  ========================= */

  useEffect(() => {
    listarDiasSemana().then(setDiasSemana);
    listarStatusVistoria().then(setStatusList);
  }, []);

  /* =========================
     LOAD APARTMENT (EDIT)
  ========================= */

  useEffect(() => {
    if (!apartment) return;

    setFormData({
      idApartamentoVistoria: apartment.idApartamentoVistoria,
      nmApartamentoVistoria: apartment.nmApartamentoVistoria,
      idDiaSemana: apartment.idDiaSemana,
      dtApartamentoVigente: apartment.dtApartamentoVigente,
      nmHorarioVistoria: apartment.nmHorarioVistoria,
      idStatusVistoria: apartment.idStatusVistoria,
      inMarcarRevistoria: apartment.inMarcarRevistoria,
      txObservacaoRevistoria: apartment.txObservacaoRevistoria,
      dtRevistoriaVigente: apartment.dtRevistoriaVigente,
    });
  }, [apartment]);

  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">

        <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-500">
          <h3 className="text-xl font-bold text-white">
            {apartment ? "Editar Apartamento" : "Novo Apartamento"}
          </h3>
          <button onClick={onClose}>
            <X className="text-white" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          <input
            required
            placeholder="Apartamento"
            value={formData.nmApartamentoVistoria}
            onChange={(e) =>
              setFormData({ ...formData, nmApartamentoVistoria: e.target.value })
            }
            className="w-full border p-2 rounded"
          />

          <select
            required
            value={formData.idDiaSemana}
            onChange={(e) =>
              setFormData({ ...formData, idDiaSemana: Number(e.target.value) })
            }
            className="w-full border p-2 rounded"
          >
            <option value={0}>Dia da Semana</option>
            {diasSemana.map((d) => (
              <option key={d.idDiaSemana} value={d.idDiaSemana}>
                {d.nmDiaSemana}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={formData.dtApartamentoVigente}
            onChange={(e) =>
              setFormData({
                ...formData,
                dtApartamentoVigente: e.target.value,
              })
            }
            className="w-full border p-2 rounded"
          />

          <input
            placeholder="Horário"
            value={formData.nmHorarioVistoria}
            onChange={(e) =>
              setFormData({
                ...formData,
                nmHorarioVistoria: e.target.value,
              })
            }
            className="w-full border p-2 rounded"
          />

          <select
            required
            value={formData.idStatusVistoria}
            onChange={(e) =>
              setFormData({
                ...formData,
                idStatusVistoria: Number(e.target.value),
              })
            }
            className="w-full border p-2 rounded"
          >
            <option value={0}>Status</option>
            {statusList.map((s) => (
              <option key={s.idStatusVistoria} value={s.idStatusVistoria}>
                {s.nmStatusVistoria}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Observação"
            value={formData.txObservacaoRevistoria || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                txObservacaoRevistoria: e.target.value,
              })
            }
            className="w-full border p-2 rounded"
          />

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border rounded p-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white rounded p-2"
            >
              Salvar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
