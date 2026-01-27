import { useState, useEffect, useRef, useMemo } from "react";
import { 
  Download, Loader2, Edit2, Upload, Trash2, Search, Filter, X, 
  FileDown, RotateCcw, MoreVertical, Trash, ChevronUp, ChevronDown 
} from "lucide-react";
import * as XLSX from "xlsx";
import type { Apartamento } from "@/shared/types";
import ApartmentModal from "@/react-app/components/ApartmentModal";

export default function DatabasePage() {
  const hiddenStatusesOnLoad = ["liberado", "nao_liberado"];
  const [nordSelecionado, setNordSelecionado] = useState<"N1" | "N2" | null>(null);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [apartamentos, setApartamentos] = useState<Apartamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApartment, setSelectedApartment] = useState<Apartamento | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set());
  const [isDeletingBatch, setIsDeletingBatch] = useState(false);

  const [activeFilterMenu, setActiveFilterMenu] = useState<string | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Apartamento; direction: 'asc' | 'desc' } | null>({ key: 'data', direction: 'asc' });
  const [expandedCells, setExpandedCells] = useState<Record<string, boolean>>({});
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({
    status: "agendado"
  });

  useEffect(() => {
    fetchApartamentos();
  }, []);

  const fetchApartamentos = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/apartamentos");
      const data = await response.json();
      setApartamentos(data);
    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApartamentos = useMemo(() => {
    let result = apartamentos.filter((apt) => {
      if (nordSelecionado) {
        const aptName = apt.apartamento ? apt.apartamento.toString().toUpperCase() : "";
        if (!aptName.includes(nordSelecionado)) return false;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        const searchFields = [
          apt.dia_semana, apt.data, apt.horario, apt.apartamento, 
          apt.vistoria, apt.status, apt.observacao
        ].map(field => String(field || "").toLowerCase());
        if (!searchFields.some(field => field.includes(term))) return false;
      }
      for (const [key, value] of Object.entries(columnFilters)) {
        if (value && String(apt[key as keyof Apartamento] || "") !== value) return false;
      }
      if (!mostrarTodos && !columnFilters.status) {
        if (hiddenStatusesOnLoad.includes(apt.status)) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      if (sortConfig) {
        const valA = String(a[sortConfig.key] || "").toLowerCase();
        const valB = String(b[sortConfig.key] || "").toLowerCase();
        if (valA !== valB) {
          return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
      }
      const dateA = String(a.data || "");
      const dateB = String(b.data || "");
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return String(a.horario || "").localeCompare(String(b.horario || ""));
    });

    return result;
  }, [apartamentos, nordSelecionado, searchTerm, columnFilters, mostrarTodos, sortConfig]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredApartamentos.length && filteredApartamentos.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredApartamentos.map(apt => apt.id)));
    }
  };

  const toggleSelectOne = (id: number | string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedIds(newSelection);
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Tem certeza que deseja excluir este agendamento?")) return;
    try {
      const response = await fetch(`/api/apartamentos/${id}`, { method: "DELETE" });
      if (response.ok) {
        setApartamentos((prev) => prev.filter((apt) => apt.id !== id));
      }
    } catch (error) {
      alert("Erro ao excluir.");
    }
  };

  const handleDeleteBatch = async () => {
    if (!confirm(`Excluir ${selectedIds.size} agendamentos selecionados?`)) return;
    setIsDeletingBatch(true);
    try {
      const idsArray = Array.from(selectedIds);
      await Promise.all(idsArray.map(id => fetch(`/api/apartamentos/${id}`, { method: "DELETE" })));
      setApartamentos(prev => prev.filter(apt => !selectedIds.has(apt.id)));
      setSelectedIds(new Set());
      alert("Exclusão concluída!");
    } catch (error) {
      alert("Erro na exclusão em lote.");
    } finally {
      setIsDeletingBatch(false);
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredApartamentos.map((apt) => ({
      "Dia da Semana": apt.dia_semana, "Data": apt.data, "Horário": apt.horario,
      "Apartamento": apt.apartamento, "Revistoria": apt.vistoria || "",
      "Data Revistoria": apt.vistoria_data || "", "Status": apt.status, "Observação": apt.observacao || "",
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Apartamentos");
    XLSX.writeFile(workbook, "apartamentos_filtrados.xlsx");
    setShowOptionsMenu(false);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      
      const payload = jsonData.map((row: any) => ({
        dia_semana: String(row["Dia da Semana"] || ""),
        data: String(row["Data"] || ""),
        horario: String(row["Horário"] || ""),
        apartamento: String(row["Apartamento"] || ""),
        vistoria: row["Revistoria"] || null,
        vistoria_data: row["Data Revistoria"] || null,
        status: String(row["Status"] || "agendado").toLowerCase().trim(),
        observacao: row["Observação"] || null,
      })).filter(apt => apt.apartamento.trim() !== "");

      const response = await fetch("/api/apartamentos/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchApartamentos();
        alert("Sincronização concluída!");
      }
    } catch (error) {
      alert("Erro ao processar arquivo.");
    } finally {
      setImporting(false);
      setShowOptionsMenu(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveApartment = async (updatedData: Apartamento) => {
    try {
      const response = await fetch("/api/apartamentos/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([updatedData]),
      });

      if (response.ok) {
        setShowModal(false);
        setSelectedApartment(null);
        await fetchApartamentos();
      } else {
        const err = await response.json();
        alert(`Erro ao salvar: ${err.error || "Verifique os dados"}`);
      }
    } catch (error) {
      alert("Erro de conexão ao salvar.");
    }
  };

  const TableHeader = ({ label, columnKey }: { label: string, columnKey: keyof Apartamento }) => {
    const options = Array.from(new Set(apartamentos.map(a => String(a[columnKey] || "")))).filter(Boolean).sort();
    const isSorted = sortConfig?.key === columnKey;

    return (
      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase border-b border-slate-200 bg-slate-50 relative">
        <div className="flex items-center justify-between">
          <span className="cursor-pointer hover:text-blue-600 flex items-center gap-1" onClick={() => setSortConfig({ key: columnKey, direction: isSorted && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
            {label} {isSorted && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
          </span>
          <button onClick={() => setActiveFilterMenu(activeFilterMenu === columnKey ? null : (columnKey as string))}>
            <Filter className={`w-3.5 h-3.5 ${columnFilters[columnKey] ? 'text-blue-600' : 'text-slate-300'}`} />
          </button>
        </div>
        {activeFilterMenu === columnKey && (
          <><div className="fixed inset-0 z-10" onClick={() => setActiveFilterMenu(null)} />
          <div className="absolute top-full left-0 mt-1 w-52 bg-white border shadow-2xl rounded-xl z-20 p-2 normal-case font-normal">
            <button onClick={() => { setColumnFilters({...columnFilters, [columnKey]: ""}); setActiveFilterMenu(null); }} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 rounded-lg text-slate-500 italic">(Mostrar Tudo)</button>
            <div className="max-h-56 overflow-y-auto border-t mt-2 pt-2">
              {options.map(opt => (
                <button key={opt} onClick={() => { setColumnFilters({...columnFilters, [columnKey]: opt}); setActiveFilterMenu(null); }} className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 rounded-lg truncate ${columnFilters[columnKey] === opt ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600'}`}>{opt}</button>
              ))}
            </div>
          </div></>
        )}
      </th>
    );
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 gap-4">
        <div className="flex flex-col gap-3">
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Banco de Dados</h2>
          <div className="flex p-1 bg-slate-100 rounded-lg border w-fit">
            <button onClick={() => setNordSelecionado(nordSelecionado === "N1" ? null : "N1")} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${nordSelecionado === "N1" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>Nord 1</button>
            <button onClick={() => setNordSelecionado(nordSelecionado === "N2" ? null : "N2")} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${nordSelecionado === "N2" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>Nord 2</button>
          </div>
        </div>

        <div className="flex-1 max-w-2xl relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" placeholder="Pesquise..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <button onClick={handleDeleteBatch} disabled={isDeletingBatch} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700">
              {isDeletingBatch ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash className="w-3.5 h-3.5" />}
              Excluir ({selectedIds.size})
            </button>
          )}

          <button onClick={() => setMostrarTodos(!mostrarTodos)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${mostrarTodos ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
            {mostrarTodos ? "Ocultando Liberados" : "Mostrar Todos"}
          </button>
          
          <button onClick={() => { setSearchTerm(""); setColumnFilters({}); setNordSelecionado(null); }} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white border text-red-600 hover:bg-red-50 transition-all shadow-sm">
            <RotateCcw className="w-3.5 h-3.5" /> Limpar
          </button>

          <div className="relative">
            <button onClick={() => setShowOptionsMenu(!showOptionsMenu)} className="p-2 hover:bg-slate-100 rounded-full border">
              <MoreVertical className="w-5 h-5 text-slate-600" />
            </button>
            {showOptionsMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border shadow-2xl rounded-xl z-40 p-2">
                <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                  <Upload className="w-4 h-4" /> Importar / Atualizar
                </button>
                <button onClick={exportToExcel} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg font-medium">
                  <Download className="w-4 h-4" /> Exportar Filtrados
                </button>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileImport} className="hidden" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-12 px-4 py-3 border-b bg-slate-50">
                  <input type="checkbox" className="rounded text-blue-600" checked={selectedIds.size === filteredApartamentos.length && filteredApartamentos.length > 0} onChange={toggleSelectAll} />
                </th>
                <TableHeader label="Dia" columnKey="dia_semana" />
                <TableHeader label="Data" columnKey="data" />
                <TableHeader label="Horário" columnKey="horario" />
                <TableHeader label="Apartamento" columnKey="apartamento" />
                <TableHeader label="Revistoria" columnKey="vistoria" />
                <TableHeader label="Status" columnKey="status" />
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase border-b bg-slate-50">Observação</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase border-b bg-slate-50 w-28">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={9} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /></td></tr>
              ) : filteredApartamentos.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-20 text-center text-slate-400 italic">Nenhum resultado.</td></tr>
              ) : (
                filteredApartamentos.map((apt) => (
                  <tr key={apt.id} className={`hover:bg-slate-50 group ${selectedIds.has(apt.id) ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-4 py-4 text-center">
                      <input type="checkbox" className="rounded text-blue-600" checked={selectedIds.has(apt.id)} onChange={() => toggleSelectOne(apt.id)} />
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{apt.dia_semana}</td>
                    <td className="px-4 py-4 text-sm text-slate-400">{apt.data}</td>
                    <td className="px-4 py-4 text-sm text-slate-400">{apt.horario}</td>
                    <td className="px-4 py-4 text-sm font-bold text-slate-700">{apt.apartamento}</td>
                    <td className="px-4 py-4 text-xs text-slate-500">{apt.vistoria || "-"}</td>
                    <td className="px-4 py-4 text-xs font-bold uppercase">
                      <span className={`px-2.5 py-1 rounded-full ${
                        apt.status === 'aprovado' ? 'bg-green-100 text-green-700' :
                        apt.status === 'reprovado' ? 'bg-red-100 text-red-700' : 
                        apt.status === 'agendado' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'
                      }`}>{apt.status}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500 truncate max-w-xs">{apt.observacao || "-"}</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { 
                            setSelectedApartment(apt); // Seta o objeto completo
                            setShowModal(true); 
                          }} 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(apt.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {showModal && (
        <ApartmentModal 
          apartment={selectedApartment} 
          onClose={() => {
            setShowModal(false);
            setSelectedApartment(null); // Limpa para a próxima abertura
          }} 
          onSave={handleSaveApartment} 
        />
      )}
    </div>
  );
}