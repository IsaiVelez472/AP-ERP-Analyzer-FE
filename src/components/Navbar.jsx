import { useFilter } from '../context/FilterContext';

function Navbar() {
  const { startFiltering, stopFiltering } = useFilter();

  const handleSearch = (event) => {
    const searchValue = event.target.value;
    if (searchValue.trim()) {
      startFiltering(searchValue);
    } else {
      stopFiltering();
    }
  };

  return (
    <header className="sticky top-0 inset-x-0 flex flex-wrap sm:justify-start sm:flex-nowrap z-[48] w-full bg-white border-b text-sm py-2.5 sm:py-4 lg:ps-64">
      <nav className="flex basis-full items-center w-full mx-auto px-4 sm:px-6 md:px-8" aria-label="Global">
        <div className="me-5 lg:me-0 lg:hidden">
          <a className="flex-none text-xl font-semibold text-gray-800" href="#" aria-label="Brand">ERP Analyzer</a>
        </div>

        <div className="w-full flex items-center justify-end ms-auto sm:justify-between sm:gap-x-3 sm:order-3">
          {/* Barra de búsqueda */}
          <div className="flex-grow max-w-xl">
            <label htmlFor="icon" className="sr-only">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none z-20 ps-4">
                <svg className="flex-shrink-0 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <input
                type="text"
                id="icon"
                name="icon"
                className="py-2 px-4 ps-11 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Buscar en todas las categorías..."
                onChange={handleSearch}
              />
            </div>
          </div>

          {/* Botón de perfil */}
          <div className="flex items-center gap-2">
            <button type="button" className="hs-dropdown-toggle inline-flex flex-shrink-0 justify-center items-center gap-2 h-[2.375rem] w-[2.375rem] rounded-full font-medium bg-white text-gray-700 align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white transition-all text-xs">
              <img className="inline-block h-[2.375rem] w-[2.375rem] rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=320&h=320&q=80" alt="User Profile" />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
