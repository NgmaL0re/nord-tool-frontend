import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router"; 
import { Plus, Loader2, Calendar, AlertCircle } from "lucide-react";
import { format, parseISO, isValid, startOfWeek, endOfWeek} from "date-fns";

import type { ApartamentoVistoriaDto } from "@/shared/types";
import { apartamentoVistoriaService } from "@/react-app/services/ApartamentoVistoriaService";
import ApartmentCard from "@/react-app/components/ApartmentCard";
import ApartmentModal from "@/react-app/components/ApartmentModal";

export default function DeliveriesPage() {
  const { sidebarOpen } = useOutletContext<{ sidebarOpen: boolean }>();
  
  const [activeTab, setActiveTab] = useState<"current" | "next" | "all">("current");
  const [filterNord, setFilterNord] = useState<"Nord 1" | "Nord 2" | null>(null);
  const [apartamentos, setApartamentos] = useState<ApartamentoVistoriaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApartment, setEditingApartment] = useState<ApartamentoVistoriaDto | null>(null);

  useEffect(() => {
    fetchApartamentos();
  }, []);

  async function fetchApartamentos() {
    try {
      setLoading(true);
      const data = await apartamentoVistoriaService.listar();
      const listaFinal = Array.isArray(data) ? data : (data as any)?.body || [];
      setApartamentos(listaFinal);
    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setLoading(false);
    }
  }

 const groupedApartments = useMemo(() => {
    // 1. Pegamos os limites da semana como strings puras "YYYY-MM-DD"
    const hoje = new Date();
    const startCur = format(startOfWeek(hoje, { weekStartsOn: 0 }), "yyyy-MM-dd");
    const endCur = format(endOfWeek(hoje, { weekStartsOn: 0 }), "yyyy-MM-dd");

    // 2. Filtramos exatamente como na aba "Tudo", mas com a trava de data
    const filtered = apartamentos.filter((apt: any) => {
      // Filtro de Nord (Igual ao "Tudo")
      const nomeApt = apt.nmApartamentoVistoria?.toUpperCase() || "";
      if (filterNord && !nomeApt.includes(filterNord.toUpperCase())) return false;
      
      // Se for "Tudo", passa direto. Se não, checa a data.
      if (activeTab === "all") return true;

      if (activeTab === "current") {
        const rawDate = apt.dtVistoria || apt.dtApartamentoVigente || apt.dtRevistoriaVigente;
        if (!rawDate) return false;

        // Pegamos apenas "YYYY-MM-DD" da string do banco
        const aptDateStr = String(rawDate).substring(0, 10);
        
        // Se a data do apt está entre o início e fim da semana (ex: "2026-03-02")
        return aptDateStr >= startCur && aptDateStr <= endCur;
      }

      return true;
    });

    // 3. Agrupamento (Idêntico ao que você já tinha, mas com SORT garantido)
    const groups = filtered.reduce<Record<string, ApartamentoVistoriaDto[]>>((acc, apt: any) => {
      const rawDate = apt.dtVistoria || apt.dtApartamentoVigente || "Sem Data";
      const key = typeof rawDate === 'string' ? rawDate.substring(0, 10) : "Sem Data";
      if (!acc[key]) acc[key] = [];
      acc[key].push(apt);
      return acc;
    }, {});

    // Ordena as chaves para as datas aparecerem na ordem certa (01, 02, 03...)
    const sortedKeys = Object.keys(groups).sort();
    const sortedGroups: Record<string, ApartamentoVistoriaDto[]> = {};
    sortedKeys.forEach(key => {
      sortedGroups[key] = groups[key];
    });

    return sortedGroups;
  }, [apartamentos, filterNord, activeTab]);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className={`flex flex-wrap items-center gap-4 transition-all duration-300 ${!sidebarOpen ? 'pl-16' : 'pl-0'}`}>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Entregas</h2>
          
          <div className="flex p-1 bg-slate-200/50 rounded-lg border border-slate-200 shadow-sm">
            {["current", "next", "all"].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)} 
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}
              >
                {tab === "current" ? "Semana Vigente" : tab === "next" ? "Próxima Semana" : "Tudo"}
              </button>
            ))}
          </div>

          <div className="flex p-1 bg-slate-200/50 rounded-lg border border-slate-200 shadow-sm">
            {["Nord 1", "Nord 2"].map((nord) => (
              <button 
                key={nord}
                onClick={() => setFilterNord(filterNord === nord ? null : nord as any)} 
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filterNord === nord ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}
              >
                {nord}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => { setEditingApartment(null); setModalOpen(true); }} 
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 transition-all"
        >
          <Plus className="w-5 h-5" /> Novo Apartamento
        </button>
      </div>

      <div className="space-y-6">
        {Object.keys(groupedApartments).length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="font-medium text-slate-500">Nenhum dado encontrado para esta seleção, **Nick**.</p>
          </div>
        ) : (
          Object.entries(groupedApartments).map(([dateKey, list]) => {
            let displayDate = dateKey;
            try {
              const parsed = parseISO(dateKey);
              if (isValid(parsed)) displayDate = format(parsed, "dd/MM/yyyy");
            } catch (e) { }

            return (
              <section key={dateKey} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-5 bg-slate-50/50 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-800">{displayDate}</h3>
                  </div>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {list.map((apt) => (
                    <ApartmentCard 
                      key={apt.idApartamentoVistoria} 
                      apartment={apt} 
                      onEdit={(a) => { setEditingApartment(a); setModalOpen(true); }} 
                      onDelete={fetchApartamentos} 
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>

      {modalOpen && (
        <ApartmentModal 
          apartment={editingApartment} 
          onClose={() => setModalOpen(false)} 
          onSave={() => { fetchApartamentos(); setModalOpen(false); }} 
        />
      )}
    </div>
  );
}