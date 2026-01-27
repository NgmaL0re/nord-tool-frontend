import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, ChevronDown, ChevronUp } from "lucide-react";

export default function SettingsPage() {
  const [apartmentList, setApartmentList] = useState("");
  const [timeSlotsList, setTimeSlotsList] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showApartmentList, setShowApartmentList] = useState(false);
  const [showTimeSlotsList, setShowTimeSlotsList] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [apartmentsResponse, timeSlotsResponse] = await Promise.all([
        fetch("/api/configuracoes/lista_apartamentos"),
        fetch("/api/configuracoes/lista_horarios"),
      ]);
      
      const apartmentsData = await apartmentsResponse.json();
      const timeSlotsData = await timeSlotsResponse.json();
      
      setApartmentList(apartmentsData.valor);
      setTimeSlotsList(timeSlotsData.valor);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    
    try {
      await Promise.all([
        fetch("/api/configuracoes/lista_apartamentos", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chave: "lista_apartamentos",
            valor: apartmentList,
          }),
        }),
        fetch("/api/configuracoes/lista_horarios", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chave: "lista_horarios",
            valor: timeSlotsList,
          }),
        }),
      ]);
      
      setMessage("Configurações salvas com sucesso!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      setMessage("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
          <SettingsIcon className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">Configurações</h2>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl space-y-6">
        {/* Time Slots Configuration - Collapsible */}
        <div>
          <button
            onClick={() => setShowTimeSlotsList(!showTimeSlotsList)}
            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <div className="text-left">
              <h3 className="text-xl font-bold text-slate-800">
                Horários Disponíveis
              </h3>
              <p className="text-sm text-slate-600">
                Configure os horários disponíveis para agendamento
              </p>
            </div>
            {showTimeSlotsList ? (
              <ChevronUp className="w-6 h-6 text-slate-600" />
            ) : (
              <ChevronDown className="w-6 h-6 text-slate-600" />
            )}
          </button>

          {showTimeSlotsList && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Horários
                </label>
                <textarea
                  value={timeSlotsList}
                  onChange={(e) => setTimeSlotsList(e.target.value)}
                  placeholder="Ex: 08:00, 09:00, 10:00, 11:00, 14:00, 15:00, 16:00"
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Exemplo: 08:00,09:00,10:00,11:00,14:00,15:00,16:00
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <h4 className="font-semibold text-slate-700 mb-3">Prévia dos Horários</h4>
                <div className="flex flex-wrap gap-2">
                  {timeSlotsList.split(",").map((time, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                    >
                      {time.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Apartments Configuration - Collapsible */}
        <div>
          <button
            onClick={() => setShowApartmentList(!showApartmentList)}
            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <div className="text-left">
              <h3 className="text-xl font-bold text-slate-800">
                Lista de Apartamentos
              </h3>
              <p className="text-sm text-slate-600">
                Configure os apartamentos disponíveis para seleção
              </p>
            </div>
            {showApartmentList ? (
              <ChevronUp className="w-6 h-6 text-slate-600" />
            ) : (
              <ChevronDown className="w-6 h-6 text-slate-600" />
            )}
          </button>

          {showApartmentList && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Apartamentos
                </label>
                <textarea
                  value={apartmentList}
                  onChange={(e) => setApartmentList(e.target.value)}
                  placeholder="Ex: 101, 102, 103, 201, 202, 203"
                  rows={5}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Exemplo: 101,102,103,201,202,203
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <h4 className="font-semibold text-slate-700 mb-3">Prévia dos Apartamentos</h4>
                <div className="flex flex-wrap gap-2">
                  {apartmentList.split(",").map((apt, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium"
                    >
                      {apt.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed w-full"
          >
            <Save className="w-5 h-5" />
            {saving ? "Salvando..." : "Salvar Configurações"}
          </button>

          {message && (
            <div className={`mt-4 p-4 rounded-lg ${
              message.includes("sucesso") 
                ? "bg-green-50 text-green-700 border border-green-200" 
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
