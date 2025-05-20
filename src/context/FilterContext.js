import { createContext, useContext, useState } from "react";

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [filterCriteria, setFilterCriteria] = useState("");

  const filterCards = (cards) => {
    if (!filterCriteria.trim()) return cards;

    const searchTerm = filterCriteria.toLowerCase();

    return cards.filter((card) => {
      const searchableContent = [
        card.title,
        card.description,
        card.category,
        card.content,
        // Agrega aquí más campos para buscar
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableContent.includes(searchTerm);
    });
  };

  const startFiltering = (criteria) => {
    setFilterCriteria(criteria);
  };

  const stopFiltering = () => {
    setFilterCriteria("");
  };

  return (
    <FilterContext.Provider
      value={{
        filterCriteria,
        startFiltering,
        stopFiltering,
        filterCards,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => useContext(FilterContext);
