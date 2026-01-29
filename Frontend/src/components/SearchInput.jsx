import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "./Input";
import { Button } from "./Button";

export function SearchInput({
  value = "",
  onChange,
  onSearch,
  onClear,
  placeholder = "Search...",
  debounceMs = 300,
  loading = false,
  showClearButton = true,
  autoFocus = false,
  className = "",
}) {
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (onChange) {
      onChange(newValue);
    }

    // Debounce search
    if (onSearch && debounceMs > 0) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        onSearch(newValue);
      }, debounceMs);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && onSearch) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      onSearch(localValue);
    }
  };

  const handleClear = () => {
    setLocalValue("");
    if (onChange) {
      onChange("");
    }
    if (onClear) {
      onClear();
    }
    if (onSearch) {
      onSearch("");
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSearchClick = () => {
    if (onSearch) {
      onSearch(localValue);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />

        <Input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="pl-10 pr-20"
        />

        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {loading && (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          )}

          {showClearButton && localValue && !loading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-3 h-3" />
            </Button>
          )}

          {onSearch && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSearchClick}
              className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Search className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function SearchBar({
  value = "",
  onChange,
  onSearch,
  placeholder = "Search projects...",
  suggestions = [],
  showSuggestions = false,
  onSuggestionClick,
  loading = false,
  className = "",
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (newValue) => {
    onChange(newValue);
    setShowDropdown(
      showSuggestions && suggestions.length > 0 && newValue.length > 0,
    );
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSuggestionClick(suggestions[highlightedIndex]);
        } else if (onSearch) {
          onSearch(value);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <SearchInput
        value={value}
        onChange={handleInputChange}
        onSearch={onSearch}
        placeholder={placeholder}
        loading={loading}
        onKeyDown={handleKeyDown}
      />

      {/* Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none ${
                index === highlightedIndex ? "bg-gray-50 dark:bg-gray-700" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 dark:text-gray-100">
                  {typeof suggestion === "string"
                    ? suggestion
                    : suggestion.title || suggestion.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
