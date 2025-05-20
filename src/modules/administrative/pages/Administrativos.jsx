import React from 'react';

function Administrativos() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Administrativos</h1>
      <p>Gestión administrativa y recursos de la empresa.</p>
      
      <div className="mt-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3">Recursos Administrativos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium text-gray-600">Recursos Humanos</h3>
            <p className="text-2xl font-bold text-indigo-600">124 empleados</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium text-gray-600">Presupuesto Administrativo</h3>
            <p className="text-2xl font-bold text-orange-600">$245,000</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium text-gray-600">Eficiencia Administrativa</h3>
            <p className="text-2xl font-bold text-teal-600">82%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Administrativos;
