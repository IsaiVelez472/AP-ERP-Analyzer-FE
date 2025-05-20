import React from 'react';

function Finanzas() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Finanzas</h1>
      <p>Información y análisis financiero de la empresa.</p>
      
      <div className="mt-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3">Resumen Financiero</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium text-gray-600">Ingresos Totales</h3>
            <p className="text-2xl font-bold text-green-600">$1,245,890</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium text-gray-600">Gastos</h3>
            <p className="text-2xl font-bold text-red-600">$876,543</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium text-gray-600">Beneficio Neto</h3>
            <p className="text-2xl font-bold text-blue-600">$369,347</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Finanzas;
