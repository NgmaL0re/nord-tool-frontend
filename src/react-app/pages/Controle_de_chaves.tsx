import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Archive, PlusCircle, Key, Box, CheckCircle, Clock, X, Edit2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { ColaboradorService, Colaborador } from '../services/ColaboradorService';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [modalType, setModalType] = useState<string | null>(null); 
  const [editingColab, setEditingColab] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Estado dos colaboradores carregados do banco
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);

  // Estado do formulário de colaborador
  const [formData, setFormData] = useState<Colaborador>({
    nome: '',
    celular: '',
    idEmpresa: 1,
    idCargo: 1,
    idPermissao: 1
  });

  const [retiradas, setRetiradas] = useState([
    { id: "RET-10001", data: "01/08/2026", apto: "EN-01-0101", retiradoPor: "João Silva", liberadoPor: "Admin" },
    { id: "RET-10002", data: "01/08/2026", apto: "EN-01-0204", retiradoPor: "Maria Souza", liberadoPor: "Admin" }
  ]);

  const [historico, setHistorico] = useState(
    Array.from({ length: 45 }, (_, i) => ({
      id: `RET-${20000 + i}`,
      data: "30/07/2026",
      apto: `EN-01-${1000 + i}`,
      retiradoPor: "João Silva",
      liberadoPor: "Admin",
      status: "Recebida"
    }))
  );

  const carregarColaboradores = async () => {
    try {
      const dados = await ColaboradorService.listar();
      setColaboradores(dados);
    } catch (err) {
      console.error("Erro ao carregar colaboradores:", err);
    }
  };

  useEffect(() => {
    carregarColaboradores();
  }, []);

  const paginatedHistorico = historico.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(historico.length / itemsPerPage);

  const openModal = (type: string, colab: any = null) => {
    setModalType(type);
    setEditingColab(colab);

    if (type === 'colaborador' || type === 'editarColaborador') {
      if (colab) {
        setFormData({
          id: colab.id,
          nome: colab.nome || '',
          celular: colab.celular || '',
          idEmpresa: colab.idEmpresa || 1,
          idCargo: colab.idCargo || 1,
          idPermissao: colab.idPermissao || 1,
        });
      } else {
        setFormData({ nome: '', celular: '', idEmpresa: 1, idCargo: 1, idPermissao: 1 });
      }
    }
  };

  const handleSalvarColaborador = async () => {
    try {
      await ColaboradorService.salvar(formData);
      await carregarColaboradores();
      setModalType(null);
    } catch (err) {
      alert("Erro ao salvar colaborador no banco.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <header className="bg-slate-900 text-white shadow-xl rounded-2xl max-w-7xl mx-auto mb-8">
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-black flex items-center gap-2 text-emerald-400 tracking-tight">
            <Key className="w-6 h-6" /> Controle de Chaves
          </h1>
          <nav className="flex flex-wrap gap-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'colaboradores', label: 'Colaboradores', icon: Users },
              { id: 'historico', label: 'Histórico', icon: Archive }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: "Chaves em Campo", value: retiradas.length, color: "text-amber-500", icon: Clock },
                { label: "Chaves no Quadro", value: 15, color: "text-emerald-500", icon: Box },
                { label: "Chaves Entregues", value: 42, color: "text-blue-500", icon: CheckCircle }
              ].map((card, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
                  <p className="text-slate-400 flex items-center gap-2 text-xs uppercase font-extrabold tracking-widest">
                    <card.icon size={16} /> {card.label}
                  </p>
                  <p className={`text-4xl font-black ${card.color} mt-2`}>{card.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 overflow-x-auto">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h3 className="font-bold text-lg text-slate-800">Retiradas Recentes</h3>
                <button 
                  onClick={() => openModal('retirada')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-semibold text-sm shadow-md shadow-emerald-500/20"
                >
                  <PlusCircle size={18} /> Nova Retirada
                </button>
              </div>
              
              <div className="min-w-[600px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
                      <th className="pb-3">Código</th>
                      <th className="pb-3">Data</th>
                      <th className="pb-3">Apartamento</th>
                      <th className="pb-3">Retirado Por</th>
                      <th className="pb-3">Liberado Por</th>
                      <th className="pb-3">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {retiradas.map(r => (
                      <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 font-mono font-bold text-emerald-600">{r.id}</td>
                        <td className="py-4 text-slate-600 text-sm">{r.data}</td>
                        <td className="py-4 text-slate-800 font-mono font-semibold text-sm">{r.apto}</td>
                        <td className="py-4 text-slate-600 text-sm">{r.retiradoPor}</td>
                        <td className="py-4 text-slate-600 text-sm">{r.liberadoPor}</td>
                        <td className="py-4">
                          <button 
                            onClick={() => openModal('confirmar', r)}
                            title="Chave Recebida" 
                            className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                          >
                            <CheckCircle size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'colaboradores' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 overflow-x-auto">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <h3 className="font-bold text-lg text-slate-800">Colaboradores</h3>
              <button 
                onClick={() => openModal('colaborador')}
                className="bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-all font-semibold text-sm"
              >
                <PlusCircle size={18} /> Cadastrar
              </button>
            </div>
            
            <div className="min-w-[600px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
                    <th className="pb-3">Nome</th>
                    <th className="pb-3">Empresa</th>
                    <th className="pb-3">Cargo</th>
                    <th className="pb-3">Celular</th>
                    <th className="pb-3">Permissão</th>
                    <th className="pb-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {colaboradores.map(c => (
                    <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 text-slate-800 font-semibold text-sm">{c.nome}</td>
                      <td className="py-4 text-slate-600 text-sm">{c.nomeEmpresa || `Empresa ${c.idEmpresa}`}</td>
                      <td className="py-4 text-slate-600 text-sm">{c.nomeCargo || `Cargo ${c.idCargo}`}</td>
                      <td className="py-4 text-slate-600 font-mono text-xs">{c.celular}</td>
                      <td className="py-4 text-slate-600 text-sm">{c.nomePermissao || `Permissão ${c.idPermissao}`}</td>
                      <td className="py-4">
                        <button onClick={() => openModal('editarColaborador', c)} className="text-emerald-600 hover:text-emerald-800">
                          <Edit2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'historico' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="font-bold text-lg text-slate-800">Histórico de Retiradas</h3>
              
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <select className="border border-slate-200 rounded-xl py-2 px-3 text-sm bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500">
                  <option>Todos</option>
                  <option>Em campo</option>
                  <option>Recebida</option>
                </select>

                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Pesquisar..." 
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl w-full text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500" 
                  />
                </div>

                <select 
                  className="border border-slate-200 rounded-xl py-2 px-3 text-sm bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                  onChange={(e) => {
                    const val = e.target.value === 'todos' ? historico.length : parseInt(e.target.value);
                    setItemsPerPage(val);
                    setCurrentPage(1);
                  }}
                >
                  <option value="20">20 itens</option>
                  <option value="50">50 itens</option>
                  <option value="100">100 itens</option>
                  <option value="todos">Todos</option>
                </select>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                  <span>Pág {currentPage} / {Math.max(1, totalPages)}</span>
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-1 hover:bg-slate-200 rounded-lg transition-colors"><ChevronLeft size={16} /></button>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-1 hover:bg-slate-200 rounded-lg transition-colors"><ChevronRight size={16} /></button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto min-w-full">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
                    <th className="pb-3">Código</th>
                    <th className="pb-3">Data</th>
                    <th className="pb-3">Apartamento</th>
                    <th className="pb-3">Retirado Por</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedHistorico.map(r => (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 font-mono font-bold text-slate-400 text-sm">{r.id}</td>
                      <td className="py-4 text-slate-500 text-sm">{r.data}</td>
                      <td className="py-4 text-slate-700 font-mono text-sm">{r.apto}</td>
                      <td className="py-4 text-slate-500 text-sm">{r.retiradoPor}</td>
                      <td className="py-4 text-emerald-600 font-semibold text-xs">{r.status}</td>
                      <td className="py-4">
                        <button onClick={() => openModal('editarRetirada', r)} className="text-emerald-600 hover:text-emerald-800 transition-colors">
                          <Edit2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {modalType && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {modalType === 'retirada' ? 'Nova Retirada' : modalType === 'confirmar' ? 'Confirmar Recebimento' : modalType === 'editarRetirada' ? 'Editar Retirada' : 'Dados do Colaborador'}
              </h2>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            
            <div className="space-y-4">
              {modalType === 'colaborador' || modalType === 'editarColaborador' ? (
                <>
                  <label className="block text-sm font-semibold text-slate-600">Nome Completo</label>
                  <input 
                    value={formData.nome} 
                    onChange={e => setFormData({...formData, nome: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
                  />
                  <label className="block text-sm font-semibold text-slate-600">Celular</label>
                  <input 
                    value={formData.celular} 
                    onChange={e => setFormData({...formData, celular: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
                  />
                  <label className="block text-sm font-semibold text-slate-600">Empresa (ID)</label>
                  <select 
                    value={formData.idEmpresa} 
                    onChange={e => setFormData({...formData, idEmpresa: Number(e.target.value)})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={1}>Empresa 1</option>
                    <option value={2}>Empresa 2</option>
                  </select>
                  <label className="block text-sm font-semibold text-slate-600">Cargo (ID)</label>
                  <select 
                    value={formData.idCargo} 
                    onChange={e => setFormData({...formData, idCargo: Number(e.target.value)})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={1}>Porteiro</option>
                    <option value={2}>Zelador</option>
                  </select>
                  <label className="block text-sm font-semibold text-slate-600">Permissão (ID)</label>
                  <select 
                    value={formData.idPermissao} 
                    onChange={e => setFormData({...formData, idPermissao: Number(e.target.value)})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={1}>Retirar</option>
                    <option value={2}>Liberar</option>
                  </select>
                  <button 
                    onClick={handleSalvarColaborador} 
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl mt-4 transition-colors"
                  >
                    Confirmar
                  </button>
                </>
              ) : modalType === 'retirada' ? (
                <>
                  <label className="block text-sm font-semibold text-slate-600">Apartamento</label>
                  <input type="text" placeholder="EN-01-0204" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                  <label className="block text-sm font-semibold text-slate-600">Retirado Por</label>
                  <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500">
                    {colaboradores.map(c => <option key={c.id}>{c.nome}</option>)}
                  </select>
                  <label className="block text-sm font-semibold text-slate-600">Liberado Por</label>
                  <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500">
                    {colaboradores.filter(c => c.idPermissao === 2).map(c => <option key={c.id}>{c.nome}</option>)}
                  </select>
                  <button onClick={() => setModalType(null)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl mt-4 transition-colors">Confirmar</button>
                </>
              ) : modalType === 'confirmar' ? (
                <>
                  <p className="text-slate-600">Confirma que a chave do apartamento <strong className="text-slate-900">{editingColab?.apto}</strong> foi devolvida ao quadro?</p>
                  <button onClick={() => setModalType(null)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl mt-4 transition-colors">Confirmar</button>
                </>
              ) : modalType === 'editarRetirada' ? (
                <>
                  <label className="block text-sm font-semibold text-slate-600">Apartamento</label>
                  <input readOnly defaultValue={editingColab?.apto} className="w-full p-3 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl cursor-not-allowed" />
                  <label className="block text-sm font-semibold text-slate-600">Retirado Por</label>
                  <input readOnly defaultValue={editingColab?.retiradoPor} className="w-full p-3 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl cursor-not-allowed" />
                  <label className="block text-sm font-semibold text-slate-600">Status</label>
                  <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500">
                    <option>Em campo</option>
                    <option>Recebida</option>
                  </select>
                  <button onClick={() => setModalType(null)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl mt-4 transition-colors">Confirmar</button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;