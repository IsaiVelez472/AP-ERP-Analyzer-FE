import "./App.scss";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Finances from "./modules/finance/pages/Finances";
import Operativos from "./modules/operational/pages/Operativos";
import Administrativos from "./modules/administrative/pages/Administrativos";
import Documentacion from "./modules/documentation/pages/Documentacion";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/finanzas" element={<Finances />} />
            <Route path="/operativos" element={<Operativos />} />
            <Route path="/administrativos" element={<Administrativos />} />
            <Route path="/documentacion" element={<Documentacion />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
