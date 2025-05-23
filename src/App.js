// Copyright 2025 Anti-Patrones
// This work is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License.
// http://creativecommons.org/licenses/by-sa/4.0/
import "./App.scss";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Finances from "./modules/finance/pages/Finances";
import Operativos from "./modules/operational/pages/Operativos";
import Administrativos from "./modules/administrative/pages/Administrativos";
import Documentacion from "./modules/documentation/pages/Documentacion";
import Sales from "./modules/sales/pages/Sales";
import MlPredicts from "./modules/ml-predicts/pages/MlPredicts";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/finance" element={<Finances />} />
            <Route path="/operations" element={<Operativos />} />
            <Route path="/administrative" element={<Administrativos />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/documentation" element={<Documentacion />} />
            <Route path="/ml-predicts" element={<MlPredicts />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
