import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router"; 
import { Plus, Loader2, Calendar, ChevronDown, ChevronRight } from "lucide-react";
import { startOfWeek, endOfWeek, addWeeks, format, parseISO, isBefore, startOfDay, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { ApartamentoVistoriaDto } from "@/shared/types";
import { apartamentoVistoriaService } from "@/react-app/services/ApartamentoVistoriaService";
import ApartmentCard from "@/react-app/components/ApartmentCard";
import ApartmentModal from "@/react-app/components/ApartmentModal";

export default function DeliveriesPage() {
  const { sidebarOpen } = useOutletContext<{ sidebarOpen: boolean }>();
  
  const [activeTab, setActiveTab] = useState<"current" | "next">("current");
  const [filterNord, setFilterNord] = useState<"Nord 1" | "Nord 2" | null>(null);
  const [apartamentos, setApartamentos] = useState<ApartamentoVistoriaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApartment, setEditingApartment] = useState<ApartamentoVistoriaDto | null>(null);
  const [collapsedDates, setCollapsedDates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchApartamentos();
  }, []);

  async function fetchApartamentos() {
    try {
      setLoading(true);
      const data = await apartamentoVistoriaService.listar();
      // Garantimos que trabalhamos com o que vem do banco
      setApartamentos(data || []);
    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setLoading(false);
    }
  }

  // Helper para garantir que o parseISO não receba sujeira
  const safeParseISO = (dateStr: string | null | undefined) => {
    if (!dateStr) return new Date(NaN);
    // Remove qualquer hora/fuso e pega apenas YYYY-MM-DD
    const cleanDate = dateStr.split('T')[0]; 
    return parseISO(cleanDate);
  };

  const groupedApartments = useMemo(() => {
    // Definimos o range da semana baseado no fuso local
    const today = startOfDay(new Date());
    const baseDate = activeTab === "current" ? today : addWeeks(today, 1);
    
    const range = {
      start: startOfWeek(baseDate, { weekStartsOn: 0 }),
      end: endOfWeek(baseDate, { weekStartsOn: 0 }),
    };

    const filtered = apartamentos.filter((apt) => {
      // Recebe do banco no formato americano (YYYY-MM-DD)
      const rawDate = apt.dtRevistoriaVigente || apt.dtApartamentoVigente;
      const date = safeParseISO(rawDate);
      
      if (!isValid(date)) return false;

      // Filtro de Semana
      const checkDate = startOfDay(date);
      const inRange = checkDate >= range.start && checkDate <= range.end;

      // Filtro Nord 1 / Nord 2
      const nomeApt = apt.nmApartamentoVistoria?.toUpperCase() || "";
      const matchesNord = !filterNord || nomeApt.includes(filterNord.toUpperCase());

      return inRange && matchesNord;
    });

    // Agrupamento usando a data americana como chave
    return filtered.reduce<Record<string, ApartamentoVistoriaDto[]>>((acc, apt) => {
      const key = apt.dtRevistoriaVigente || apt.dtApartamentoVigente || "Sem Data";
      const cleanKey = key.split('T')[0];
      if (!acc[cleanKey]) acc[cleanKey] = [];
      acc[cleanKey].push(apt);
      return acc;
    }, {});
  }, [apartamentos, activeTab, filterNord]);

  const handleEdit = (apt: ApartamentoVistoriaDto) => {
    setEditingApartment(apt);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div className={`flex items-center gap-4 shrink-0 transition-all duration-300 ${!sidebarOpen ? 'pl-16' : 'pl-0'}`}>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight whitespace-nowrap">Entregas</h2>
          <div className="flex p-1 bg-slate-200/50 rounded-lg border border-slate-200 shadow-sm">
            <button onClick={() => setFilterNord(filterNord === "Nord 1" ? null : "Nord 1")} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filterNord === "Nord 1" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>Nord 1</button>
            <button onClick={() => setFilterNord(filterNord === "Nord 2" ? null : "Nord 2")} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filterNord === "Nord 2" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>Nord 2</button>
          </div>
        </div>
        <button onClick={() => { setEditingApartment(null); setModalOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 transition-all">
          <Plus className="w-5 h-5" /> Novo Apartamento
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-2 p-1 bg-slate-200/30 rounded-xl border border-slate-200">
        <button onClick={() => setActiveTab("current")} className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === "current" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>Semana Vigente</button>
        <button onClick={() => setActiveTab("next")} className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === "next" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>Próxima Semana</button>
      </div>

      {/* LISTAGEM */}
      <div className="space-y-6">
        {Object.keys(groupedApartments).length === 0 ? (
          <div className="text-center py-20 text-slate-400 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p className="font-medium">Nenhuma entrega encontrada, Nick.</p>
          </div>
        ) : (
          Object.entries(groupedApartments).map(([dateKey, list]) => {
            const dateObj = safeParseISO(dateKey);
            const isPast = isValid(dateObj) && isBefore(startOfDay(dateObj), startOfDay(new Date()));
            const isCollapsed = collapsedDates[dateKey] ?? isPast;

            return (
              <section key={dateKey} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div onClick={() => setCollapsedDates(prev => ({...prev, [dateKey]: !isCollapsed}))} className="flex items-center gap-4 p-5 cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className={`p-2 rounded-lg ${isPast ? 'bg-slate-100' : 'bg-blue-50 text-blue-600'}`}>
                    {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                  <div className="flex flex-col">
                    <h3 className={`font-bold capitalize ${isPast ? 'text-slate-400' : 'text-slate-800'}`}>
                      {isValid(dateObj) ? format(dateObj, "EEEE", { locale: ptBR }) : dateKey}
                    </h3>
                    {/* Exibição Convertida para BR apenas aqui no visual */}
                    <p className="text-xs text-slate-500 font-medium">
                      {isValid(dateObj) ? format(dateObj, "dd/MM/yyyy") : dateKey}
                    </p>
                  </div>
                  <span className="ml-auto text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{list.length} {list.length === 1 ? 'entrega' : 'entregas'}</span>
                </div>
                {!isCollapsed && (
                  <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-2">
                    {list.map((apt) => (
                      <ApartmentCard 
                        key={apt.idApartamentoVistoria} 
                        apartment={apt} 
                        onEdit={handleEdit} 
                        onDelete={async (id) => {
                          if(confirm("Excluir?")) {
                            await apartamentoVistoriaService.deletar(id);
                            fetchApartamentos();
                          }
                        }}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>

      {modalOpen && <ApartmentModal apartment={editingApartment} onClose={() => setModalOpen(false)} onSave={() => { fetchApartamentos(); setModalOpen(false); }} />}
    </div>
  );
}