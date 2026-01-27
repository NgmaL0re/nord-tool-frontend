import { useState, useEffect, useMemo } from "react";
import { Plus, Loader2, Calendar, ChevronDown, ChevronRight } from "lucide-react";
import { startOfWeek, endOfWeek, addWeeks, format, parseISO, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Apartamento } from "@/shared/types";
import ApartmentCard from "@/react-app/components/ApartmentCard";
import ApartmentModal from "@/react-app/components/ApartmentModal";

export default function DeliveriesPage() {
  const [activeTab, setActiveTab] = useState<"current" | "next">("current");
  const [filterNord, setFilterNord] = useState<"N1" | "N2" | null>(null);
  const [apartamentos, setApartamentos] = useState<Apartamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApartment, setEditingApartment] = useState<Apartamento | null>(null);
  
  // Estado para controlar quais datas estão colapsadas manualmente
  const [collapsedDates, setCollapsedDates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchApartamentos();
  }, []);

  const fetchApartamentos = async () => {
    try {
      const response = await fetch("/api/apartamentos");
      const data = await response.json();
      setApartamentos(data);
    } catch (error) {
      console.error("Erro ao carregar apartamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Funções de auxílio para datas
  const getCurrentWeekRange = () => {
    const today = new Date();
    return {
      start: startOfWeek(today, { weekStartsOn: 0 }),
      end: endOfWeek(today, { weekStartsOn: 0 }),
    };
  };

  const getNextWeekRange = () => {
    const today = new Date();
    const nextWeek = addWeeks(today, 1);
    return {
      start: startOfWeek(nextWeek, { weekStartsOn: 0 }),
      end: endOfWeek(nextWeek, { weekStartsOn: 0 }),
    };
  };

  const groupedApartments = useMemo(() => {
    const range = activeTab === "current" ? getCurrentWeekRange() : getNextWeekRange();
    const today = startOfDay(new Date());
    
    const filtered = apartamentos.filter((apt) => {
      const dateToCheck = apt.vistoria_data || apt.data;
      if (!dateToCheck || dateToCheck === "Invalid Date") return false;

      const aptDate = parseISO(dateToCheck);
      const isInRange = aptDate >= range.start && aptDate <= range.end;

      const identificador = apt.apartamento ? apt.apartamento.toString().toUpperCase() : "";
      const matchesNord = filterNord === null || identificador.startsWith(filterNord.toUpperCase());

      return isInRange && matchesNord;
    });

    const groups: Record<string, Apartamento[]> = {};
    
    filtered.sort((a, b) => {
        const dateA = (a.vistoria_data || a.data) || "";
        const dateB = (b.vistoria_data || b.data) || "";
        if (dateA !== dateB) return dateA.localeCompare(dateB);
        return (a.horario || "").localeCompare(b.horario || "");
    });

    filtered.forEach((apt) => {
      const dateKey = apt.vistoria_data || apt.data;
      if (dateKey && dateKey !== "Invalid Date") {
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(apt);
      }
    });

    return groups;
  }, [apartamentos, activeTab, filterNord]);

  const toggleDateCollapse = (date: string) => {
    setCollapsedDates(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  // Lógica para verificar se o dia já passou
  const isDatePast = (dateStr: string) => {
    const date = parseISO(dateStr);
    return isBefore(date, startOfDay(new Date()));
  };

  // Restante das funções de clique... (toggleNordFilter, handleAdd, etc permanecem iguais)
  const toggleNordFilter = (value: "N1" | "N2") => {
    setFilterNord(prev => prev === value ? null : value);
  };

  const handleAdd = () => { setEditingApartment(null); setModalOpen(true); };
  const handleEdit = (apartment: Apartamento) => { setEditingApartment(apartment); setModalOpen(true); };
  const handleSave = async () => { await fetchApartamentos(); setModalOpen(false); };
  const handleDelete = async (id: number) => {
    if (!confirm("Deseja realmente excluir este apartamento?")) return;
    try {
      await fetch(`/api/apartamentos/${id}`, { method: "DELETE" });
      await fetchApartamentos();
    } catch (error) { console.error(error); }
  };

  const currentWeekRange = getCurrentWeekRange();
  const nextWeekRange = getNextWeekRange();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const hasDeliveries = Object.keys(groupedApartments).length > 0;

  return (
    <div className="p-8">
      {/* Header e Filtros (Seu código original aqui...) */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-6">
          <h2 className="text-3xl font-bold text-slate-800">Entregas</h2>
          <div className="flex p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button onClick={() => toggleNordFilter("N1")} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${filterNord === "N1" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>Nord 1</button>
            <button onClick={() => toggleNordFilter("N2")} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${filterNord === "N2" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>Nord 2</button>
          </div>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all">
          <Plus className="w-5 h-5" /> Novo Apartamento
        </button>
      </div>

      {/* Tabs de Semanas */}
      <div className="flex gap-2 mb-8 bg-white rounded-lg p-1 shadow-md">
        <button onClick={() => setActiveTab("current")} className={`flex-1 px-6 py-3 rounded-md transition-all font-medium ${activeTab === "current" ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md" : "text-slate-600"}`}>
          Semana Vigente <span className="block text-xs mt-1 opacity-90">{format(currentWeekRange.start, "dd/MM")} - {format(currentWeekRange.end, "dd/MM")}</span>
        </button>
        <button onClick={() => setActiveTab("next")} className={`flex-1 px-6 py-3 rounded-md transition-all font-medium ${activeTab === "next" ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md" : "text-slate-600"}`}>
          Próxima Semana <span className="block text-xs mt-1 opacity-90">{format(nextWeekRange.start, "dd/MM")} - {format(nextWeekRange.end, "dd/MM")}</span>
        </button>
      </div>

      {/* Conteúdo Agrupado com Ocultação */}
      <div className="space-y-6">
        {!hasDeliveries ? (
          <div className="text-center py-12 text-slate-500 bg-white rounded-xl border-2 border-dashed border-slate-200">Nenhum apartamento encontrado</div>
        ) : (
          Object.entries(groupedApartments).map(([date, apartmentsInDay]) => {
            const isPast = isDatePast(date);
            // Está colapsado se o usuário clicou OU se é passado e o usuário ainda não clicou para abrir
            const isCollapsed = collapsedDates[date] ?? isPast;

            return (
              <section key={date} className={`transition-opacity duration-300 ${isPast ? 'opacity-60 hover:opacity-100' : ''}`}>
                <div 
                  onClick={() => toggleDateCollapse(date)}
                  className="flex items-center gap-3 mb-4 border-b border-slate-200 pb-2 cursor-pointer group hover:border-blue-300"
                >
                  <div className={`p-2 rounded-lg transition-colors ${isPast ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-blue-600'}`}>
                      {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                  <div>
                      <h3 className={`text-lg font-bold capitalize ${isPast ? 'text-slate-500' : 'text-slate-700'}`}>
                          {format(parseISO(date), "EEEE", { locale: ptBR })}
                          {isPast && <span className="ml-2 text-xs font-normal text-slate-400">(Encerrado)</span>}
                      </h3>
                      <p className="text-sm text-slate-500">{format(parseISO(date), "dd 'de' MMMM", { locale: ptBR })}</p>
                  </div>
                  <span className="ml-auto bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">
                      {apartmentsInDay.length} {apartmentsInDay.length === 1 ? 'entrega' : 'entregas'}
                  </span>
                </div>
                
                {!isCollapsed && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-300">
                    {apartmentsInDay.map((apt) => (
                      <ApartmentCard key={apt.id} apartment={apt} onEdit={handleEdit} onDelete={handleDelete} />
                    ))}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>

      {modalOpen && <ApartmentModal apartment={editingApartment} onClose={() => setModalOpen(false)} onSave={handleSave} />}
    </div>
  );
}