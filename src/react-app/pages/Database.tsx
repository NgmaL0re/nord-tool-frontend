import { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Loader2,
  Edit2,
  Upload,
  Trash2,
  Search,
  Filter,
  RotateCcw,
  MoreVertical,
  Trash,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import * as XLSX from "xlsx";

import ApartmentModal from "@/react-app/components/ApartmentModal";

import { apartamentoVistoriaService } from "@/react-app/services/ApartamentoVistoriaService";

import type {
  ApartamentoVistoriaDto,
  ApartamentoVistoriaForm,
} from "@/shared/types";

export default function DatabasePage() {
  /* =======================
     STATES
  ======================= */

  const hiddenStatusesOnLoad = ["liberado", "nao_liberado"];

  const [apartamentos, setApartamentos] = useState<ApartamentoVistoriaDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedApartment, setSelectedApartment] =
    useState<ApartamentoVistoriaDto | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isDeletingBatch, setIsDeletingBatch] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [mostrarTodos, setMostrarTodos] = useState(false);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof ApartamentoVistoriaDto;
    direction: "asc" | "desc";
  } | null>(null);

  const [activeFilterMenu, setActiveFilterMenu] = useState<string | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({
    idStatusVistoria: "",
  });

  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [importing, setImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* =======================
     DATA LOAD
  ======================= */

  useEffect(() => {
    fetchApartamentos();
  }, []);

  const fetchApartamentos = async () => {
    setLoading(true);
    try {
      const data = await apartamentoVistoriaService.listar();
      setApartamentos(data);
    } catch (error) {
      console.error("Erro ao carregar apartamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     FILTER / SORT
  ======================= */

  const filteredApartamentos = useMemo(() => {
    let result = apartamentos.filter((apt) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const fields = [
          apt.nmApartamentoVistoria,
          apt.nmStatusVistoria,
          apt.nmDiaSemana,
          apt.nmHorarioVistoria,
        ]
          .map((v) => v ?? "")
          .join(" ")
          .toLowerCase();

        if (!fields.includes(term)) return false;
      }

      if (!mostrarTodos && hiddenStatusesOnLoad.includes(apt.nmStatusVistoria ?? ""))
        return false;

      for (const [key, value] of Object.entries(columnFilters)) {
        if (value && String(apt[key as keyof ApartamentoVistoriaDto]) !== value)
          return false;
      }

      return true;
    });

    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = String(a[sortConfig.key] ?? "");
        const bVal = String(b[sortConfig.key] ?? "");
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
    }

    return result;
  }, [apartamentos, searchTerm, mostrarTodos, columnFilters, sortConfig]);

  /* =======================
     ACTIONS
  ======================= */

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredApartamentos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(
        new Set(
          filteredApartamentos
            .map((a) => a.idApartamentoVistoria)
            .filter(Boolean) as number[]
        )
      );
    }
  };

  const toggleSelectOne = (id: number) => {
    const copy = new Set(selectedIds);
    copy.has(id) ? copy.delete(id) : copy.add(id);
    setSelectedIds(copy);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja excluir este registro?")) return;
    await apartamentoVistoriaService.deletar(id);
    setApartamentos((prev) =>
      prev.filter((a) => a.idApartamentoVistoria !== id)
    );
  };

  const handleDeleteBatch = async () => {
    if (!confirm(`Excluir ${selectedIds.size} registros?`)) return;

    setIsDeletingBatch(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => apartamentoVistoriaService.deletar(id))
      );
      setApartamentos((prev) =>
        prev.filter((a) => !selectedIds.has(a.idApartamentoVistoria!))
      );
      setSelectedIds(new Set());
    } finally {
      setIsDeletingBatch(false);
    }
  };

  const handleFileImport = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      await apartamentoVistoriaService.importar(file);
      await fetchApartamentos();
    } finally {
      setImporting(false);
      setShowOptionsMenu(false);
    }
  };

  const handleSaveApartment = async (data: ApartamentoVistoriaForm) => {
    if (data.idApartamentoVistoria) {
      await apartamentoVistoriaService.editar(data);
    } else {
      await apartamentoVistoriaService.criar(data);
    }
    setShowModal(false);
    setSelectedApartment(null);
    await fetchApartamentos();
  };

  /* =======================
     RENDER
  ======================= */

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">Banco de Dados</h2>

      {/* ações topo */}
      <div className="flex items-center gap-4 mb-6">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar..."
          className="border px-3 py-2 rounded-lg"
        />

        <button onClick={() => setMostrarTodos(!mostrarTodos)}>
          {mostrarTodos ? "Ocultando liberados" : "Mostrar todos"}
        </button>

        <button onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-4 h-4" /> Importar
        </button>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileImport}
        />
      </div>

      {/* tabela */}
      {loading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    selectedIds.size === filteredApartamentos.length &&
                    filteredApartamentos.length > 0
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Apartamento</th>
              <th>Status</th>
              <th>Dia</th>
              <th>Horário</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredApartamentos.map((apt) => (
              <tr key={apt.idApartamentoVistoria}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(
                      apt.idApartamentoVistoria!
                    )}
                    onChange={() =>
                      toggleSelectOne(apt.idApartamentoVistoria!)
                    }
                  />
                </td>
                <td>{apt.nmApartamentoVistoria}</td>
                <td>{apt.nmStatusVistoria}</td>
                <td>{apt.nmDiaSemana}</td>
                <td>{apt.nmHorarioVistoria}</td>
                <td className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedApartment(apt);
                      setShowModal(true);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      handleDelete(apt.idApartamentoVistoria!)
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <ApartmentModal
          apartment={selectedApartment}
          onClose={() => setShowModal(false)}
          onSave={handleSaveApartment}
        />
      )}
    </div>
  );
}
