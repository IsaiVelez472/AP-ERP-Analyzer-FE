import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.scss";
import Dashboard from "./components/Dashboard";
import Layout from "./components/Layout";
import { FilterProvider } from "./context/FilterContext";
import Administrativos from "./modules/administrative/pages/Administrativos";
import Documentacion from "./modules/documentation/pages/Documentacion";
import Finances from "./modules/finance/pages/Finances";
import Operativos from "./modules/operational/pages/Operativos";

function App() {
  return (
    <div className="App">
      <FilterProvider>
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
      </FilterProvider>
    </div>
  );
}

export default App;
