import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router";
import {
  Loader2,
  Edit2,
  Trash2,
  Search,
  RotateCcw,
  Filter,
  ArrowUpDown,
  FileSpreadsheet,
  ChevronDown,
  Upload,
  Download
} from "lucide-react";
import * as XLSX from "xlsx";

import ApartmentModal from "@/react-app/components/ApartmentModal";
import { apartamentoVistoriaService } from "@/react-app/services/ApartamentoVistoriaService";
import type { ApartamentoVistoriaDto } from "@/shared/types";

export default function DatabasePage() {
  const { sidebarOpen } = useOutletContext<{ sidebarOpen: boolean }>();

  /* =======================
      STATES
  ======================= */
  const [apartamentos, setApartamentos] = useState<ApartamentoVistoriaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApartment, setSelectedApartment] = useState<ApartamentoVistoriaDto | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [nordSelecionado, setNordSelecionado] = useState<"N1" | "N2" | null>(null);
  const [showExcelMenu, setShowExcelMenu] = useState(false);

  const [colFilters, setColFilters] = useState({ apartamento: "", status: "Agendado", data: "", horario: "" });
  const [visibleFilters, setVisibleFilters] = useState({ apartamento: false, status: false, data: false, horario: false });
  
  const [sortConfig, setSortConfig] = useState<{ key: keyof ApartamentoVistoriaDto | null, direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchApartamentos();

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowExcelMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchApartamentos = async () => {
    setLoading(true);
    try {
      const data = await apartamentoVistoriaService.listar();
      setApartamentos(data || []);
    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setLoading(false);
    }
  };

  /* =======================
      HELPERS
  ======================= */

  const formatarDataParaBusca = (dataRaw: string | undefined) => {
    if (!dataRaw || dataRaw === "Sem agendamento" || dataRaw.trim() === "") return "";
    const dataApenas = dataRaw.split('T')[0];
    const partes = dataApenas.split('-');
    if (partes.length < 3) return dataApenas;
    const [ano, mes, dia] = partes;
    return `${dia}/${mes}/${ano}`;
  };

  const handleDownloadTemplate = () => {
    const header = [
      {
        "nmApartamentoVistoria": "N1-01-0101",
        "nmStatusVistoria": "Agendado",
        "dtApartamentoVigente": "2026-02-18",
        "nmHorarioVistoria": "14:00",
        "nmObservacaoVistoria": "Exemplo de preenchimento"
      }
    ];
    const ws = XLSX.utils.json_to_sheet(header);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modelo_Importacao");
    XLSX.writeFile(wb, "NordTool_Modelo_Importacao.xlsx");
    setShowExcelMenu(false);
  };

  const handleExportData = () => {
    const dadosParaExportar = filteredApartamentos.map(apt => ({
      "Apartamento": apt.nmApartamentoVistoria,
      "Status": apt.nmStatusVistoria,
      "Data": formatarDataParaBusca(apt.dtApartamentoVigente),
      "Dia da Semana": apt.nmDiaSemana,
      "Horário": apt.nmHorarioVistoria || "--:--"
    }));

    const ws = XLSX.utils.json_to_sheet(dadosParaExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dados_Vistoria");
    XLSX.writeFile(wb, `NordTool_Export_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
    setShowExcelMenu(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      await apartamentoVistoriaService.importar(file);
      await fetchApartamentos();
      setShowExcelMenu(false);
      alert("Planilha importada com sucesso!");
    } catch (error) {
      console.error("Erro na importação:", error);
      alert("Erro ao importar planilha. Verifique se o arquivo segue o modelo.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const formatarDataExibicao = (dataRaw: string | undefined, diaSemana: string | undefined) => {
    if (!dataRaw || dataRaw === "Sem agendamento") return diaSemana || "Sem agendamento";
    const dataBr = formatarDataParaBusca(dataRaw);
    if (!dataBr || dataBr.includes('undefined')) return diaSemana || "Sem agendamento";
    return diaSemana && diaSemana !== "Sem agendamento" ? `${dataBr} - ${diaSemana}` : dataBr;
  };

  /* =======================
      ACTIONS
  ======================= */
  const handleEdit = (apt: ApartamentoVistoriaDto) => {
    setSelectedApartment(apt);
    setShowModal(true);
  };

  const handleSaveApartment = async () => {
    setShowModal(false);
    setSelectedApartment(null);
    await fetchApartamentos();
  };

  const toggleFilter = (key: keyof typeof visibleFilters) => {
    setVisibleFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSort = (key: keyof ApartamentoVistoriaDto) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  /* =======================
      FILTER & SORT LOGIC
  ======================= */
  const filteredApartamentos = useMemo(() => {
    const hiddenStatus = "não liberado";
    
    let result = apartamentos.filter((apt) => {
      const statusApt = apt.nmStatusVistoria?.toLowerCase() || "";
      const dataFormatada = formatarDataParaBusca(apt.dtApartamentoVigente);

      if (!mostrarTodos && statusApt.includes(hiddenStatus)) return false;
      if (nordSelecionado) {
        const nome = apt.nmApartamentoVistoria?.toUpperCase() || "";
        if (!nome.startsWith(nordSelecionado)) return false;
      }

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const searchFields = [
            apt.nmApartamentoVistoria, 
            apt.nmStatusVistoria, 
            dataFormatada,
            apt.nmHorarioVistoria
        ].map(v => v?.toLowerCase() || "").join(" ");
        if (!searchFields.includes(term)) return false;
      }
      
      if (colFilters.apartamento && !apt.nmApartamentoVistoria?.toLowerCase().includes(colFilters.apartamento.toLowerCase())) return false;
      if (colFilters.status && !statusApt.includes(colFilters.status.toLowerCase())) return false;
      
      if (colFilters.data) {
        const dataApt = apt.dtApartamentoVigente?.split('T')[0]; 
        if (dataApt !== colFilters.data) return false;
      }
      
      if (colFilters.horario && !apt.nmHorarioVistoria?.toLowerCase().includes(colFilters.horario.toLowerCase())) return false;
      return true;
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        const valA = String(a[sortConfig.key!] || "").toLowerCase();
        const valB = String(b[sortConfig.key!] || "").toLowerCase();

        if (valA === valB) {
          if (sortConfig.key === 'dtApartamentoVigente') {
            const timeA = String(a.nmHorarioVistoria || "").toLowerCase();
            const timeB = String(b.nmHorarioVistoria || "").toLowerCase();
            return timeA.localeCompare(timeB) * (sortConfig.direction === 'asc' ? 1 : -1);
          }
          return 0;
        }
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      result.sort((a, b) => (a.nmApartamentoVistoria || "").localeCompare(b.nmApartamentoVistoria || ""));
    }

    return result;
  }, [apartamentos, searchTerm, mostrarTodos, nordSelecionado, colFilters, sortConfig]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-nowrap">
        <div className={`flex items-center gap-4 shrink-0 transition-all duration-300 ${!sidebarOpen ? 'pl-16' : 'pl-0'}`}>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Banco de Dados</h2>
          <div className="flex p-1 bg-slate-200/50 rounded-lg border border-slate-200">
            <button onClick={() => setNordSelecionado(nordSelecionado === "N1" ? null : "N1")} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${nordSelecionado === "N1" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>Nord 1</button>
            <button onClick={() => setNordSelecionado(nordSelecionado === "N2" ? null : "N2")} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${nordSelecionado === "N2" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>Nord 2</button>
          </div>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Busca global (ex: 18/02)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm" />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setMostrarTodos(!mostrarTodos)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${mostrarTodos ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}>{mostrarTodos ? "Ocultando" : "Mostrar Todos"}</button>
          
          <button onClick={() => { 
            setSearchTerm(""); 
            setNordSelecionado(null); 
            setColFilters({apartamento:"", status:"", data:"", horario: ""}); 
            setVisibleFilters({apartamento:false, status:false, data:false, horario: false});
            setSortConfig({ key: null, direction: 'asc' });
          }} className="p-2 text-red-600 bg-white border border-slate-200 rounded-xl hover:bg-red-50 shadow-sm"><RotateCcw className="w-4 h-4" /></button>
          
          <div className="relative" ref={menuRef}>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImportExcel} 
              accept=".xlsx, .xls" 
              className="hidden" 
            />
            <button onClick={() => setShowExcelMenu(!showExcelMenu)} className="p-2 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-sm transition-all flex items-center gap-1">
              <FileSpreadsheet className="w-4 h-4" />
              <ChevronDown className={`w-3 h-3 transition-transform ${showExcelMenu ? 'rotate-180' : ''}`} />
            </button>

            {showExcelMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <button 
                  onClick={handleImportClick}
                  className="flex items-center gap-3 w-full px-4 py-3 text-xs text-slate-700 hover:bg-slate-50 border-b border-slate-100"
                >
                  <Upload className="w-4 h-4 text-blue-500" /> Importar planilha
                </button>
                <button 
                  onClick={handleExportData}
                  className="flex items-center gap-3 w-full px-4 py-3 text-xs text-slate-700 hover:bg-slate-50 border-b border-slate-100"
                >
                  <Download className="w-4 h-4 text-green-500" /> Exportar planilha
                </button>
                <button 
                  onClick={handleDownloadTemplate} 
                  className="flex items-center gap-3 w-full px-4 py-3 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <FileSpreadsheet className="w-4 h-4 text-amber-500" /> Planilha modelo
                </button>
              </div>
)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="w-12 px-4 py-4 text-center border-r border-slate-100"><input type="checkbox" className="rounded text-blue-600" /></th>
                <th className="px-4 py-4 text-left min-w-[150px]">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleFilter('apartamento')} className="text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-blue-500 flex items-center gap-1">
                        Apartamento <Filter className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleSort('nmApartamentoVistoria')}><ArrowUpDown className="w-3 h-3 text-slate-400" /></button>
                    </div>
                    {visibleFilters.apartamento && <input type="text" autoFocus placeholder="Filtrar..." value={colFilters.apartamento} onChange={(e) => setColFilters({...colFilters, apartamento: e.target.value})} className="text-[10px] p-1 border rounded" />}
                  </div>
                </th>
                <th className="px-4 py-4 text-left min-w-[120px]">
                  <div className="flex flex-col gap-2">
                    <button onClick={() => toggleFilter('status')} className="text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-blue-500 flex items-center gap-1">Status <Filter className="w-3 h-3" /></button>
                    {visibleFilters.status && (
                        <select value={colFilters.status} onChange={(e) => setColFilters({...colFilters, status: e.target.value})} className="text-[10px] p-1 border rounded">
                            <option value="">Todos</option>
                            <option value="Aprovado">Aprovado</option>
                            <option value="Reprovado">Reprovado</option>
                            <option value="Agendado">Agendado</option>
                            <option value="Liberado">Liberado</option>
                            <option value="Não Liberado">Não Liberado</option>
                        </select>
                    )}
                  </div>
                </th>
                <th className="px-4 py-4 text-left min-w-[140px]">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleFilter('data')} className="text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-blue-500 flex items-center gap-1">Data <Filter className="w-3 h-3" /></button>
                      <button onClick={() => handleSort('dtApartamentoVigente')}><ArrowUpDown className="w-3 h-3 text-slate-400" /></button>
                    </div>
                    {visibleFilters.data && <input type="date" value={colFilters.data} onChange={(e) => setColFilters({...colFilters, data: e.target.value})} className="text-[10px] p-1 border rounded" />}
                  </div>
                </th>
                <th className="px-4 py-4 text-left min-w-[120px] text-xs font-bold text-slate-400 uppercase tracking-wider">Horário</th>
                <th className="px-4 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /></td></tr>
              ) : (
                filteredApartamentos.map((apt) => {
                  const status = apt.nmStatusVistoria?.toLowerCase() || "";
                  let statusClasses = "bg-blue-50 text-blue-600";
                  if (status.includes('aprovado')) statusClasses = "bg-green-50 text-green-700";
                  if (status.includes('reprovado')) statusClasses = "bg-red-50 text-red-700";
                  if (status.includes('agendado')) statusClasses = "bg-slate-100 text-slate-600";
                  if (status.includes('não liberado')) statusClasses = "bg-slate-900 text-white";

                  return (
                    <tr key={apt.idApartamentoVistoria} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-4 text-center border-r border-slate-50"><input type="checkbox" className="rounded text-blue-600" /></td>
                      <td className="px-4 py-4 text-sm font-bold text-slate-700">{apt.nmApartamentoVistoria}</td>
                      <td className="px-4 py-4 text-xs font-bold uppercase">
                        <span className={`px-2.5 py-1 rounded-full ${statusClasses}`}>
                          {apt.nmStatusVistoria}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600 font-medium">{formatarDataExibicao(apt.dtApartamentoVigente, apt.nmDiaSemana)}</td>
                      <td className="px-4 py-4 text-sm text-slate-400 font-medium">{apt.nmHorarioVistoria || "--:--"}</td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(apt)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ApartmentModal
          apartment={selectedApartment}
          onClose={() => { setShowModal(false); setSelectedApartment(null); }}
          onSave={handleSaveApartment}
        />
      )}
    </div>
  );
}