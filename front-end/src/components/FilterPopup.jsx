import React, { useEffect, useState } from 'react';
import '../styles/FilterPopup.css';
import { getCuisines, getNeighborhoods, searchRestaurants } from '../api/Restaurant';

const FilterPopup = ({ open, close, onApplyFilters, onSelectRestaurant, filters }) => {
  const [search, setSearch] = useState('');
  const [cuisines, setCuisines] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");

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

  const handleSelectCuisine = (cuisine) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine) ? prev.filter((item) => item !== cuisine) : [...prev, cuisine]
    );
  }

  const handleSelectNeighborgood = (neighborhood) => {
    setSelectedNeighborhoods((prev) =>
      prev.includes(neighborhood) ? prev.filter((item) => item !== neighborhood) : [...prev, neighborhood]
    );

  };

  const removeFilter = (type, value) => {
    console.log(type, value)
    console.log(selectedCuisines, selectedNeighborhoods)
    if (type === "cuisine") {
      setSelectedCuisines((prev) => prev.filter((item) => item !== value));
    } else if (type === "neighborhood") {
      setSelectedNeighborhoods((prev) => prev.filter((item) => item !== value));
    }
  };

  const getFilteredOptions = () => {
    const lowerCaseSearch = filterSearch.toLowerCase();
    const allOptions = [...cuisines, ...neighborhoods];
    return allOptions.filter(
      (option) =>
        option.toLowerCase().includes(lowerCaseSearch) &&
        ![...selectedCuisines, ...selectedNeighborhoods].includes(option)
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

  const reorderList = (list, selectedItems) => {
    const selected = list.filter((item) => selectedItems.includes(item));
    const unselected = list.filter((item) => !selectedItems.includes(item));
    return [...selected, ...unselected];
  };


  const handleOverlayClick = () => {
    setSearch('');
    setSearchResults([]);
    close();
  };

  function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
  }

  function processPills(arr) {
    return arr
        .filter(str => str.trim() !== '') // Remove empty strings or strings with only whitespace
        .map(str => str
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        );
  }

  useEffect(() => {
    async function fetchPills() {
      const neighborhoods = await getNeighborhoods();
      const cuisines = await getCuisines();
      setNeighborhoods(processPills(neighborhoods))
      setCuisines(processPills(cuisines))
    }
    fetchPills()
  }, [])

  useEffect(() => {
    if(!filters?.cuisines?.length) setSelectedCuisines([]);
    if(!filters?.neighborhoods?.length) setSelectedNeighborhoods([]);
  }, [filters])

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
        <h2>Search by Name</h2>
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
      <h2>Search by Tag</h2>
        <div className="pill-slider">
          {selectedCuisines.map((pill, index) => (
            <div key={index} className="filter-pill">
              {pill} <button onClick={() => removeFilter("cuisine", pill)}>x</button>
            </div>
          ))}
          {selectedNeighborhoods.map((pill, index) => (
            <div key={index} className="filter-pill">
              {pill} <button onClick={() => removeFilter("neighborhood", pill)}>x</button>
            </div>
          ))}
        </div>
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Search filters..."
            className="filter-search-bar"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
          />
          {filterSearch && (
            <button className="clear-search-button" onClick={() => setFilterSearch("")}>
              x
            </button>
          )}
        </div>
        {filterSearch && (
          <ul className="filter-dropdown">
            {getFilteredOptions().map((option, index) => (
              <li
                key={index}
                className="filter-dropdown-item"
                onClick={() =>
                  {
                    console.log(option)
                    if (cuisines.includes(option)) {
                      handleSelectCuisine(option);
                    } else {
                      handleSelectNeighborgood(option);
                    }
                  }
                }
              >
                {option}
              </li>
            ))}
          </ul>
        )}

          <div className="filter-section">
            <h3>Cuisines</h3>
            <div className="options-slider">
              {reorderList(cuisines, selectedCuisines).map((cuisine) => (
                <div
                  key={cuisine}
                  className={`filter-option ${
                    selectedCuisines.includes(cuisine) ? "selected" : ""
                  }`}
                  onClick={() => handleSelectCuisine(cuisine)}
                >
                  {cuisine}
                </div>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Neighborhoods</h3>
            <div className="options-slider">
              {reorderList(neighborhoods, selectedNeighborhoods).map((neighborhood) => (
                <div
                  key={neighborhood}
                  className={`filter-option ${
                    selectedNeighborhoods.includes(neighborhood) ? "selected" : ""
                  }`}
                  onClick={() => handleSelectNeighborgood(neighborhood)}
                >
                  {neighborhood}
                </div>
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
