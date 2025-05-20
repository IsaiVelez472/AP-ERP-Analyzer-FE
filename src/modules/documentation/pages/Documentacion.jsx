import React from 'react';

function Documentacion() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Documentación</h1>
      <p>Documentos y recursos informativos de la empresa.</p>
      
      <div className="mt-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3">Recursos Documentales</h2>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-4">
              <svg className="w-6 h-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Manual de Procedimientos</h3>
              <p className="text-sm text-gray-600">Última actualización: 15/04/2025</p>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg flex items-center">
            <div className="bg-green-100 p-2 rounded-lg mr-4">
              <svg className="w-6 h-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Políticas Corporativas</h3>
              <p className="text-sm text-gray-600">Última actualización: 02/03/2025</p>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg flex items-center">
            <div className="bg-purple-100 p-2 rounded-lg mr-4">
              <svg className="w-6 h-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Guía de Referencia Técnica</h3>
              <p className="text-sm text-gray-600">Última actualización: 20/05/2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Documentacion;
