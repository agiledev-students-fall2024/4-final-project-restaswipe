import React, { useState } from 'react';
import '../styles/FilterPopup.css';
import { searchRestaurants } from '../api/Restaurant';

const cuisines = [
  "American", "Chinese", "Italian", "Mexican", "Japanese", "French", "Thai", "Indian",
  "Mediterranean", "Greek", "Spanish", "Korean", "Vietnamese", "Middle Eastern", "Lebanese",
  "Turkish", "Caribbean", "Latin American", "African", "Vegetarian", "Vegan", "Seafood",
  "Steakhouse", "Pizza", "Burgers", "Sushi", "Barbecue", "Tapas", "Bakery", "Cafe", "Diner",
  "Dessert", "Breakfast", "Brunch", "Cocktails", "Wine Bar",
];

const neighborhoods = [
  "Alphabet City", "Battery Park City", "Carnegie Hill", "Chelsea", "Chinatown", "East Harlem",
  "East Village", "Financial District", "Flatiron District", "Gramercy Park", "Greenwich Village",
  "Harlem", "Hells Kitchen", "Clinton", "Inwood", "Kips Bay", "Lincoln Square", "Lower East Side",
  "Manhattan Valley", "Midtown East", "Morningside Heights", "Murray Hill", "Little Italy",
  "Roosevelt Island", "SoHo", "Tribeca", "Upper East Side", "Upper West Side",
  "Washington Heights", "West Village"
];

const FilterPopup = ({ open, close, onApplyFilters, onSelectRestaurant }) => {
  const [search, setSearch] = useState('');
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchChange = async (event) => {
    const value = event.target.value;
    setSearch(value);

    if (value.trim() === '') {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchRestaurants(value);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching for restaurants:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCuisineChange = (event) => {
    const value = event.target.value;
    setSelectedCuisines(
      selectedCuisines.includes(value)
        ? selectedCuisines.filter((cuisine) => cuisine !== value)
        : [...selectedCuisines, value]
    );
  };

  const handleNeighborhoodChange = (event) => {
    const value = event.target.value;
    setSelectedNeighborhoods(
      selectedNeighborhoods.includes(value)
        ? selectedNeighborhoods.filter((neighborhood) => neighborhood !== value)
        : [...selectedNeighborhoods, value]
    );
  };

  const handleSearchSelect = async (restaurant) => {
    try {
      onSelectRestaurant(restaurant);
      setSearch('');
      setSearchResults([]);
      close();
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
    }
  };

  const handleOverlayClick = () => {
    setSearch('');
    setSearchResults([]);
    close();
  };

  const handleApplyFilters = () => {
    onApplyFilters({
      cuisines: selectedCuisines,
      neighborhoods: selectedNeighborhoods,
    });
    close();
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Search/Filter Restaurants</h2>
        <div className="dialog-content">
          <input
            type="text"
            placeholder="Search by name"
            value={search}
            onChange={handleSearchChange}
            className="search-input"
          />
           {isSearching && <div className="loading">Searching...</div>}
           {searchResults.length > 0 && (
            <ul className="search-results">
              {searchResults.map((restaurant, index) => (
                <li
                  key={index}
                  onClick={() => handleSearchSelect(restaurant)}
                  className="search-result-item"
                >
                  {restaurant.name}
                </li>
              ))}
            </ul>
          )}
          {searchResults.length === 0 && search && !isSearching && (
            <div className="no-results">No restaurants found.</div>
          )}

          <div className="filter-section">
            <h3>Cuisines</h3>
            <div className="checkbox-group">
              {cuisines.map((cuisine) => (
                <label key={cuisine}>
                  <input
                    type="checkbox"
                    value={cuisine}
                    checked={selectedCuisines.includes(cuisine)}
                    onChange={handleCuisineChange}
                  />
                  {cuisine}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Neighborhoods</h3>
            <div className="checkbox-group">
              {neighborhoods.map((neighborhood) => (
                <label key={neighborhood}>
                  <input
                    type="checkbox"
                    value={neighborhood}
                    checked={selectedNeighborhoods.includes(neighborhood)}
                    onChange={handleNeighborhoodChange}
                  />
                  {neighborhood}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="dialog-actions">
          <button onClick={handleApplyFilters} className="apply-button">
            Apply Filters
          </button>
          <button onClick={close} className="close-button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPopup;
