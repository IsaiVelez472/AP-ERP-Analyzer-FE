// Copyright 2025 Anti-Patrones
// This work is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License.
// http://creativecommons.org/licenses/by-sa/4.0/
import React, { useState, useRef } from 'react';
import { reinitPreline } from '../../../utils/preline';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function Documentacion() {
  const [activeTab, setActiveTab] = useState('proceso');
  const [exporting, setExporting] = useState(false);
  
  // Referencia al contenedor principal para exportar PDF
  const reportContainerRef = useRef(null);

  // Datos del proceso de construcción
  const fasesConstruccion = [
    {
      id: 1,
      titulo: 'Ideación',
      fecha: '10 Mayo, 2025',
      icono: '💡',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-200',
      descripcion: 'Fase inicial donde identificamos el problema y definimos la solución.',
      actividades: [
        'Identificación del problema: Análisis de ineficiencias en procesos ERP',
        'Investigación de mercado y análisis de competidores',
        'Brainstorming de soluciones innovadoras',
        'Definición de propuesta de valor única'
      ],
      herramientas: ['Miro', 'Figma', 'Google Forms'],
      entregables: ['Documento de visión', 'Análisis de mercado', 'Propuesta inicial']
    },
    {
      id: 2,
      titulo: 'Diseño',
      fecha: '12 Mayo, 2025',
      icono: '🎨',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200',
      descripcion: 'Creación de prototipos y definición de la experiencia de usuario.',
      actividades: [
        'Creación de wireframes y prototipos de baja fidelidad',
        'Diseño de arquitectura de la aplicación',
        'Definición de la experiencia de usuario (UX)',
        'Selección de paleta de colores y elementos visuales'
      ],
      herramientas: ['Figma', 'Adobe XD', 'Sketch'],
      entregables: ['Prototipos', 'Guía de estilos', 'Diagrama de arquitectura']
    },
    {
      id: 3,
      titulo: 'Desarrollo',
      fecha: '15 Mayo, 2025',
      icono: '👨‍💻',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
      descripcion: 'Implementación del código y funcionalidades del producto.',
      actividades: [
        'Configuración del entorno de desarrollo',
        'Implementación del frontend con React y Tailwind CSS',
        'Desarrollo de API y backend con Node.js',
        'Integración con servicios de terceros y APIs'
      ],
      herramientas: ['React', 'Node.js', 'Tailwind CSS', 'GitHub'],
      entregables: ['Código fuente', 'Documentación técnica', 'API endpoints']
    },
    {
      id: 4,
      titulo: 'Pruebas',
      fecha: '18 Mayo, 2025',
      icono: '🧪',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-200',
      descripcion: 'Validación de la calidad y usabilidad del producto.',
      actividades: [
        'Pruebas unitarias y de integración',
        'Testing de usabilidad con usuarios potenciales',
        'Optimización de rendimiento y experiencia de usuario',
        'Corrección de bugs y mejoras basadas en feedback'
      ],
      herramientas: ['Jest', 'Cypress', 'Lighthouse'],
      entregables: ['Informe de pruebas', 'Métricas de rendimiento', 'Feedback de usuarios']
    },
    {
      id: 5,
      titulo: 'Lanzamiento',
      fecha: '20 Mayo, 2025',
      icono: '🚀',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200',
      descripcion: 'Presentación del producto final en la hackathon.',
      actividades: [
        'Preparación de la presentación para la hackathon',
        'Creación de material promocional y pitch deck',
        'Despliegue de la aplicación en producción',
        'Presentación del producto ante el jurado'
      ],
      herramientas: ['Netlify', 'Vercel', 'Canva', 'Google Slides'],
      entregables: ['Aplicación en producción', 'Pitch deck', 'Demo funcional']
    }
  ];

  // Datos de la arquitectura técnica
  const arquitecturaTecnica = {
    frontend: {
      titulo: 'Frontend',
      tecnologias: ['React 19.1.0', 'Tailwind CSS 3.4.17', 'Chart.js 4.4.9', 'Framer Motion'],
      descripcion: 'Interfaz de usuario moderna y responsiva con componentes reutilizables.',
      caracteristicas: [
        'Visualización de datos con gráficos interactivos',
        'Diseño responsivo para múltiples dispositivos',
        'Animaciones fluidas para mejorar la experiencia de usuario',
        'Tema claro con alto contraste para mejor legibilidad'
      ]
    },
    backend: {
      titulo: 'Backend',
      tecnologias: ['Node.js', 'Express', 'MongoDB', 'Python (análisis de datos)'],
      descripcion: 'API RESTful para procesamiento y análisis de datos ERP.',
      caracteristicas: [
        'Endpoints optimizados para consultas complejas',
        'Procesamiento asíncrono de grandes volúmenes de datos',
        'Algoritmos de machine learning para análisis predictivo',
        'Caché inteligente para mejorar tiempos de respuesta'
      ]
    },
    integraciones: {
      titulo: 'Integraciones',
      tecnologias: ['API REST', 'Webhooks', 'OAuth 2.0'],
      descripcion: 'Conectores con sistemas ERP y servicios de terceros.',
      caracteristicas: [
        'Integración con SAP, Oracle y Microsoft Dynamics',
        'Sincronización en tiempo real de datos críticos',
        'Autenticación segura mediante OAuth 2.0',
        'Validación y transformación de datos'
      ]
    },
    despliegue: {
      titulo: 'Infraestructura',
      tecnologias: ['Docker', 'Kubernetes', 'AWS', 'CI/CD (GitHub Actions)'],
      descripcion: 'Infraestructura escalable y automatizada.',
      caracteristicas: [
        'Contenedores Docker para entornos consistentes',
        'Orquestación con Kubernetes para alta disponibilidad',
        'Despliegue automatizado mediante CI/CD',
        'Monitoreo y alertas proactivas'
      ]
    }
  };

  // Función para exportar el informe como PDF
  const exportToPDF = async () => {
    if (!reportContainerRef.current) return;

    try {
      setExporting(true);

      const element = reportContainerRef.current;
      const canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('ap_erp_analyzer_documentacion.pdf');

      setExporting(false);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setExporting(false);
    }
  };

  return (
    <div className="p-6" ref={reportContainerRef}>
      {/* Cabecera con botón de exportar */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Documentación del Proyecto</h1>
          <p className="text-gray-600">
            Proceso de construcción y arquitectura técnica de AP-ERP Analyzer
          </p>
        </div>
        <button
          onClick={exportToPDF}
          disabled={exporting}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {exporting ? "Exportando..." : "Exportar PDF"}
        </button>
      </div>

      {/* Tabs de navegación */}
      <div className="border-b border-gray-200 mb-6">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('proceso')}
              className={`inline-block py-4 px-4 text-sm font-medium ${activeTab === 'proceso' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'}`}
            >
              Proceso de Construcción
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('arquitectura')}
              className={`inline-block py-4 px-4 text-sm font-medium ${activeTab === 'arquitectura' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'}`}
            >
              Arquitectura Técnica
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('recursos')}
              className={`inline-block py-4 px-4 text-sm font-medium ${activeTab === 'recursos' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'}`}
            >
              Recursos y Documentos
            </button>
          </li>
        </ul>
      </div>

      {/* Contenido de la pestaña Proceso de Construcción */}
      {activeTab === 'proceso' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
            <p className="font-bold">Proceso de Desarrollo</p>
            <p>Metodología ágil con ciclos de desarrollo iterativos de 2 días para la hackathon.</p>
          </div>
          
          {/* Línea de tiempo del proceso */}
          <div className="relative">
            {/* Línea vertical */}
            <div className="absolute left-8 inset-y-0 w-0.5 bg-gray-200"></div>
            
            {/* Fases del proyecto */}
            {fasesConstruccion.map((fase) => (
              <div key={fase.id} className="mb-8 flex items-start">
                {/* Icono de la fase */}
                <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full ${fase.bgColor} ${fase.borderColor} border-2 shadow-md mr-4`}>
                  <span className={`text-2xl ${fase.color}`}>{fase.icono}</span>
                </div>
                
                {/* Contenido de la fase */}
                <div className="flex-1">
                  <div className={`p-5 rounded-lg shadow-sm border ${fase.borderColor} bg-white`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`text-lg font-bold ${fase.color}`}>{fase.titulo}</h3>
                      <span className="text-sm text-gray-500">{fase.fecha}</span>
                    </div>
                    <p className="text-gray-600 mb-3">{fase.descripcion}</p>
                    
                    {/* Detalles de la fase */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {/* Actividades */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Actividades Clave</h4>
                        <ul className="space-y-1">
                          {fase.actividades.map((actividad, idx) => (
                            <li key={idx} className="flex items-start text-sm">
                              <span className="text-green-500 mr-2">✓</span>
                              <span className="text-gray-600">{actividad}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Herramientas y Entregables */}
                      <div>
                        <div className="mb-3">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Herramientas</h4>
                          <div className="flex flex-wrap gap-2">
                            {fase.herramientas.map((herramienta, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                {herramienta}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Entregables</h4>
                          <ul className="space-y-1">
                            {fase.entregables.map((entregable, idx) => (
                              <li key={idx} className="text-sm text-gray-600">
                                • {entregable}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Resumen del proceso */}
          <div className="bg-white border rounded-lg shadow-sm p-5 mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Resumen del Proceso</h3>
            <p className="text-gray-600 mb-4">
              El desarrollo de AP-ERP Analyzer se realizó en un formato intensivo de hackathon, con un enfoque en la
              entrega rápida de valor y la innovación. El equipo siguió una metodología ágil adaptada para el contexto
              de competencia, priorizando la funcionalidad central y la experiencia de usuario.  
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Duración Total</h4>
                <p className="text-2xl font-bold text-blue-600">10 días</p>
                <p className="text-sm text-gray-500">Desde ideación hasta presentación</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Equipo</h4>
                <p className="text-2xl font-bold text-blue-600">5 personas</p>
                <p className="text-sm text-gray-500">Desarrolladores full-stack y diseñadores</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Sprints</h4>
                <p className="text-2xl font-bold text-blue-600">5 sprints</p>
                <p className="text-sm text-gray-500">De 2 días cada uno</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Contenido de la pestaña Arquitectura Técnica */}
      {activeTab === 'arquitectura' && (
        <div className="space-y-6">
          {/* Diagrama de arquitectura */}
          <div className="bg-white border rounded-lg shadow-sm p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Arquitectura del Sistema</h3>
            <p className="text-gray-600 mb-4">
              AP-ERP Analyzer utiliza una arquitectura moderna basada en microservicios, con separación clara entre
              frontend y backend, permitiendo escalabilidad y mantenimiento independiente de los componentes.  
            </p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
              <p className="text-sm text-gray-500 mb-2">Diagrama de Arquitectura</p>
              <div className="h-64 flex items-center justify-center border border-dashed border-gray-300 rounded bg-white">
                <p className="text-gray-400">Diagrama de arquitectura del sistema</p>
              </div>
            </div>
          </div>
          
          {/* Componentes técnicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Frontend */}
            <div className="bg-white border rounded-lg shadow-sm p-5">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <span className="text-blue-600 text-lg">🖥️</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800">{arquitecturaTecnica.frontend.titulo}</h3>
              </div>
              <p className="text-gray-600 mb-3">{arquitecturaTecnica.frontend.descripcion}</p>
              
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Tecnologías</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {arquitecturaTecnica.frontend.tecnologias.map((tech, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                    {tech}
                  </span>
                ))}
              </div>
              
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Características</h4>
              <ul className="space-y-1">
                {arquitecturaTecnica.frontend.caracteristicas.map((caracteristica, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>{caracteristica}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Backend */}
            <div className="bg-white border rounded-lg shadow-sm p-5">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <span className="text-green-600 text-lg">⚙️</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800">{arquitecturaTecnica.backend.titulo}</h3>
              </div>
              <p className="text-gray-600 mb-3">{arquitecturaTecnica.backend.descripcion}</p>
              
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Tecnologías</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {arquitecturaTecnica.backend.tecnologias.map((tech, idx) => (
                  <span key={idx} className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs">
                    {tech}
                  </span>
                ))}
              </div>
              
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Características</h4>
              <ul className="space-y-1">
                {arquitecturaTecnica.backend.caracteristicas.map((caracteristica, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>{caracteristica}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Integraciones */}
            <div className="bg-white border rounded-lg shadow-sm p-5">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <span className="text-purple-600 text-lg">🔄</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800">{arquitecturaTecnica.integraciones.titulo}</h3>
              </div>
              <p className="text-gray-600 mb-3">{arquitecturaTecnica.integraciones.descripcion}</p>
              
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Tecnologías</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {arquitecturaTecnica.integraciones.tecnologias.map((tech, idx) => (
                  <span key={idx} className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-xs">
                    {tech}
                  </span>
                ))}
              </div>
              
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Características</h4>
              <ul className="space-y-1">
                {arquitecturaTecnica.integraciones.caracteristicas.map((caracteristica, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span>{caracteristica}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Infraestructura */}
            <div className="bg-white border rounded-lg shadow-sm p-5">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                  <span className="text-red-600 text-lg">☁️</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800">{arquitecturaTecnica.despliegue.titulo}</h3>
              </div>
              <p className="text-gray-600 mb-3">{arquitecturaTecnica.despliegue.descripcion}</p>
              
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Tecnologías</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {arquitecturaTecnica.despliegue.tecnologias.map((tech, idx) => (
                  <span key={idx} className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs">
                    {tech}
                  </span>
                ))}
              </div>
              
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Características</h4>
              <ul className="space-y-1">
                {arquitecturaTecnica.despliegue.caracteristicas.map((caracteristica, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>{caracteristica}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Contenido de la pestaña Recursos y Documentos */}
      {activeTab === 'recursos' && (
        <div className="space-y-6">
          <div className="bg-white border rounded-lg shadow-sm p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Documentación del Proyecto</h3>
            <p className="text-gray-600 mb-4">
              Documentos y recursos relacionados con el desarrollo y uso de AP-ERP Analyzer.
            </p>
            
            {/* Lista de documentos */}
            <div className="space-y-4">
              {/* Documento 1 */}
              <div className="p-4 border rounded-lg flex items-center hover:bg-gray-50 transition-colors">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">Manual de Usuario</h4>
                  <p className="text-sm text-gray-600">Guía completa para el uso de la plataforma</p>
                </div>
                <div className="text-sm text-gray-500">
                  PDF • 2.4 MB
                </div>
              </div>
              
              {/* Documento 2 */}
              <div className="p-4 border rounded-lg flex items-center hover:bg-gray-50 transition-colors">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">Documentación Técnica</h4>
                  <p className="text-sm text-gray-600">Especificaciones técnicas y API</p>
                </div>
                <div className="text-sm text-gray-500">
                  PDF • 3.8 MB
                </div>
              </div>
              
              {/* Documento 3 */}
              <div className="p-4 border rounded-lg flex items-center hover:bg-gray-50 transition-colors">
                <div className="bg-purple-100 p-3 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">Presentación de la Hackathon</h4>
                  <p className="text-sm text-gray-600">Pitch deck utilizado en la presentación</p>
                </div>
                <div className="text-sm text-gray-500">
                  PPTX • 5.1 MB
                </div>
              </div>
              
              {/* Documento 4 */}
              <div className="p-4 border rounded-lg flex items-center hover:bg-gray-50 transition-colors">
                <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">Guía de Instalación</h4>
                  <p className="text-sm text-gray-600">Instrucciones para instalar y configurar</p>
                </div>
                <div className="text-sm text-gray-500">
                  PDF • 1.2 MB
                </div>
              </div>
            </div>
          </div>
          
          {/* Enlaces y recursos */}
          <div className="bg-white border rounded-lg shadow-sm p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Enlaces y Recursos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a href="#" className="p-4 border rounded-lg flex items-center hover:bg-gray-50 transition-colors">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <span className="text-blue-600 text-xl">🔗</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Repositorio GitHub</h4>
                  <p className="text-sm text-gray-600">Código fuente del proyecto</p>
                </div>
              </a>
              
              <a href="#" className="p-4 border rounded-lg flex items-center hover:bg-gray-50 transition-colors">
                <div className="bg-red-100 p-2 rounded-lg mr-3">
                  <span className="text-red-600 text-xl">🎬</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Video Demo</h4>
                  <p className="text-sm text-gray-600">Demostración del producto</p>
                </div>
              </a>
              
              <a href="#" className="p-4 border rounded-lg flex items-center hover:bg-gray-50 transition-colors">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <span className="text-green-600 text-xl">📊</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Datos de Prueba</h4>
                  <p className="text-sm text-gray-600">Conjunto de datos para testing</p>
                </div>
              </a>
              
              <a href="#" className="p-4 border rounded-lg flex items-center hover:bg-gray-50 transition-colors">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <span className="text-purple-600 text-xl">🛠️</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">API Playground</h4>
                  <p className="text-sm text-gray-600">Entorno para probar la API</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>© 2025 Anti-Patrones. Desarrollado para la Hackathon 2025.</p>
        <div className="mt-2 flex justify-center space-x-4">
          <a href="#" className="hover:text-blue-600 transition-colors">Contacto</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Términos</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Privacidad</a>
        </div>
      </div>
    </div>
  );
}

export default Documentacion;
