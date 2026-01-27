import { BrowserRouter as Router, Routes, Route } from "react-router";
import Layout from "@/react-app/components/Layout";
import DatabasePage from "@/react-app/pages/Database";
import DashboardPage from "@/react-app/pages/Dashboard";
import DeliveriesPage from "@/react-app/pages/Deliveries";
import SettingsPage from "@/react-app/pages/Settings";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DeliveriesPage />} />
          <Route path="database" element={<DatabasePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="configuracoes" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
