import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Loader2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  format,
  parseISO,
  isBefore,
  startOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";

import type { ApartamentoVistoriaDto } from "@/shared/types";
import { apartamentoVistoriaService } from "@/react-app/services/ApartamentoVistoriaService";

import ApartmentCard from "@/react-app/components/ApartmentCard";
import ApartmentModal from "@/react-app/components/ApartmentModal";

export default function DeliveriesPage() {
  const [activeTab, setActiveTab] = useState<"current" | "next">("current");
  const [filterNord, setFilterNord] = useState<"N1" | "N2" | null>(null);
  const [apartamentos, setApartamentos] = useState<ApartamentoVistoriaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApartment, setEditingApartment] =
    useState<ApartamentoVistoriaDto | null>(null);
  const [collapsedDates, setCollapsedDates] =
    useState<Record<string, boolean>>({});

  /* ======================
     DATA FETCH
  ====================== */
  async function fetchApartamentos() {
    try {
      setLoading(true);
      const data = await apartamentoVistoriaService.listar();
      setApartamentos(data);
    } catch (error) {
      console.error("Erro ao carregar apartamentos:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApartamentos();
  }, []);

  /* ======================
     DATE HELPERS
  ====================== */
  const getCurrentWeekRange = () => {
    const today = new Date();
    return {
      start: startOfWeek(today, { weekStartsOn: 0 }),
      end: endOfWeek(today, { weekStartsOn: 0 }),
    };
  };

  const getNextWeekRange = () => {
    const nextWeek = addWeeks(new Date(), 1);
    return {
      start: startOfWeek(nextWeek, { weekStartsOn: 0 }),
      end: endOfWeek(nextWeek, { weekStartsOn: 0 }),
    };
  };

  /* ======================
     GROUP & FILTER
  ====================== */
  const groupedApartments = useMemo(() => {
    const range =
      activeTab === "current"
        ? getCurrentWeekRange()
        : getNextWeekRange();

    const filtered = apartamentos.filter((apt) => {
      const dateStr = apt.dtRevistoriaVigente || apt.dtApartamentoVigente;
      if (!dateStr || dateStr === "Invalid Date") return false;

      const date = parseISO(dateStr);
      const inRange = date >= range.start && date <= range.end;

      const identificador =
        apt.nmApartamentoVistoria?.toString().toUpperCase() ?? "";

      const matchesNord =
        filterNord === null ||
        identificador.startsWith(filterNord);

      return inRange && matchesNord;
    });

    filtered.sort((a, b) => {
      const da = a.dtRevistoriaVigente || a.dtApartamentoVigente || "";
      const db = b.dtRevistoriaVigente || b.dtApartamentoVigente || "";
      if (da !== db) return da.localeCompare(db);
      return (a.nmHorarioVistoria || "").localeCompare(b.nmHorarioVistoria || "");
    });

    return filtered.reduce<Record<string, ApartamentoVistoriaDto[]>>((acc, apt) => {
      const key = apt.dtRevistoriaVigente || apt.dtApartamentoVigente!;
      acc[key] = acc[key] || [];
      acc[key].push(apt);
      return acc;
    }, {});
  }, [apartamentos, activeTab, filterNord]);

  /* ======================
     ACTIONS
  ====================== */
  const toggleDateCollapse = (date: string) => {
    setCollapsedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const isDatePast = (dateStr: string) =>
    isBefore(parseISO(dateStr), startOfDay(new Date()));

  const toggleNordFilter = (value: "N1" | "N2") => {
    setFilterNord((prev) => (prev === value ? null : value));
  };

  const handleAdd = () => {
    setEditingApartment(null);
    setModalOpen(true);
  };

  const handleEdit = (apartment: ApartamentoVistoriaDto) => {
    setEditingApartment(apartment);
    setModalOpen(true);
  };

  const handleSave = async () => {
    await fetchApartamentos();
    setModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja realmente excluir este apartamento?")) return;
    try {
      await apartamentoVistoriaService.deletar(id);
      await fetchApartamentos();
    } catch (error) {
      console.error(error);
    }
  };

  /* ======================
     RENDER
  ====================== */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const hasDeliveries = Object.keys(groupedApartments).length > 0;
  const currentWeek = getCurrentWeekRange();
  const nextWeek = getNextWeekRange();

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-6">
          <h2 className="text-3xl font-bold text-slate-800">
            Entregas
          </h2>

          <div className="flex p-1 bg-slate-100 rounded-lg border">
            {(["N1", "N2"] as const).map((n) => (
              <button
                key={n}
                onClick={() => toggleNordFilter(n)}
                className={`px-4 py-1.5 rounded-md text-sm font-bold ${
                  filterNord === n
                    ? "bg-white text-blue-600 shadow"
                    : "text-slate-500"
                }`}
              >
                Nord {n[1]}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow"
        >
          <Plus className="w-5 h-5" /> Novo Apartamento
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-8 bg-white rounded-lg p-1 shadow">
        {[
          {
            key: "current",
            label: "Semana Vigente",
            range: currentWeek,
          },
          {
            key: "next",
            label: "Próxima Semana",
            range: nextWeek,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 px-6 py-3 rounded-md font-medium ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                : "text-slate-600"
            }`}
          >
            {tab.label}
            <span className="block text-xs mt-1">
              {format(tab.range.start, "dd/MM")} -{" "}
              {format(tab.range.end, "dd/MM")}
            </span>
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {!hasDeliveries ? (
        <div className="text-center py-12 text-slate-500 bg-white rounded-xl border-2 border-dashed">
          Nenhum apartamento encontrado
        </div>
      ) : (
        Object.entries(groupedApartments).map(([date, list]) => {
          const past = isDatePast(date);
          const collapsed = collapsedDates[date] ?? past;

          return (
            <section key={date} className="mb-6">
              <div
                onClick={() => toggleDateCollapse(date)}
                className="flex items-center gap-3 cursor-pointer border-b pb-2"
              >
                {collapsed ? (
                  <ChevronRight />
                ) : (
                  <ChevronDown />
                )}

                <div>
                  <h3 className="font-bold capitalize">
                    {format(parseISO(date), "EEEE", { locale: ptBR })}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {format(parseISO(date), "dd 'de' MMMM", {
                      locale: ptBR,
                    })}
                  </p>
                </div>

                <span className="ml-auto text-xs bg-slate-100 px-2 py-1 rounded">
                  {list.length} entregas
                </span>
              </div>

              {!collapsed && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                  {list.map((apt) => (
                    <ApartmentCard
                      key={apt.idApartamentoVistoria}
                      apartment={apt}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })
      )}

      {modalOpen && (
        <ApartmentModal
          apartment={editingApartment}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
