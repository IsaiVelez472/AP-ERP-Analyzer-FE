import { useFilter } from '../context/FilterContext';

function CardGrid({ cards, renderCard }) {
  const { filterCards } = useFilter();
  const filteredCards = filterCards(cards);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredCards.map((card, index) => renderCard(card, index))}
    </div>
  );
}

export default CardGrid;
