import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Save,
  ChevronDown,
  ChevronUp,
} from "lucide-react";


export default function SettingsPage() {
  const [apartmentList, setApartmentList] = useState("");
  const [timeSlotsList, setTimeSlotsList] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [showApartmentList, setShowApartmentList] = useState(false);
  const [showTimeSlotsList, setShowTimeSlotsList] = useState(false);

  /* ======================
     LOAD SETTINGS
  ====================== */
  async function fetchSettings() {
    try {
      setLoading(true);

      /*const [apartamentos, horarios] = await Promise.all([
        configuracaoService.buscar("lista_apartamentos"),
        configuracaoService.buscar("lista_horarios"),
      ]);

      setApartmentList(apartamentos);
      setTimeSlotsList(horarios);*/
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      setMessage("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  /* ======================
     SAVE SETTINGS
  ====================== */
  async function handleSave() {
    try {
      setSaving(true);
      setMessage("");

      /*await Promise.all([
        configuracaoService.salvar(
          "lista_apartamentos",
          apartmentList
        ),
        configuracaoService.salvar(
          "lista_horarios",
          timeSlotsList
        ),
      ]);*/

      setMessage("Configurações salvas com sucesso!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      setMessage("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  }

  /* ======================
     LOADING
  ====================== */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  /* ======================
     RENDER
  ====================== */
  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
          <SettingsIcon className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">
          Configurações
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl space-y-6">
        {/* =====================
            HORÁRIOS
        ===================== */}
        <div>
          <button
            onClick={() =>
              setShowTimeSlotsList((prev) => !prev)
            }
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
              <textarea
                value={timeSlotsList}
                onChange={(e) =>
                  setTimeSlotsList(e.target.value)
                }
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                placeholder="08:00,09:00,10:00"
              />

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">
                  Prévia dos Horários
                </h4>
                <div className="flex flex-wrap gap-2">
                  {timeSlotsList
                    .split(",")
                    .map((time, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm"
                      >
                        {time.trim()}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =====================
            APARTAMENTOS
        ===================== */}
        <div>
          <button
            onClick={() =>
              setShowApartmentList((prev) => !prev)
            }
            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <div className="text-left">
              <h3 className="text-xl font-bold text-slate-800">
                Lista de Apartamentos
              </h3>
              <p className="text-sm text-slate-600">
                Configure os apartamentos disponíveis
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
              <textarea
                value={apartmentList}
                onChange={(e) =>
                  setApartmentList(e.target.value)
                }
                rows={5}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                placeholder="101,102,201"
              />

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">
                  Prévia dos Apartamentos
                </h4>
                <div className="flex flex-wrap gap-2">
                  {apartmentList
                    .split(",")
                    .map((apt, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm"
                      >
                        {apt.trim()}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =====================
            SAVE
        ===================== */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? "Salvando..." : "Salvar Configurações"}
        </button>

        {message && (
          <div
            className={`p-4 rounded-lg text-sm ${
              message.includes("sucesso")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
