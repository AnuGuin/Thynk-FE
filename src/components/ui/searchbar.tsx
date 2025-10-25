import React, { useState, ChangeEvent } from 'react';
interface SearchBarProps {
  onSearch: (searchTerm: string) => void; 
  placeholder?: string; 
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder = 'Search...' }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Handle changes in the input field
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    onSearch(value); // Trigger the search callback with the current value
  };

  return (
    <div className="search-bar-container">
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleChange}
        className="search-input"
      />
      {/* You can add a search icon here if desired */}
    </div>
  );
};

export default SearchBar;