'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Country, State, City } from 'country-state-city';
import { Globe, Map, MapPin } from 'lucide-react';

/* ─── Searchable Custom Combobox Dropdown Item ──────────────── */
function SearchableSelect({
  icon: Icon,
  placeholder,
  value,
  options = [],
  onChange,
  disabled = false,
  error = '',
  showLabel = false,
  labelTitle = '',
  nameKey = 'location-search',
  showIcon = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  // Filter options based on searchQuery
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter((opt) =>
      (opt.label || opt.value || '').toLowerCase().includes(q)
    );
  }, [options, searchQuery]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Display label when closed
  const displayValue = useMemo(() => {
    if (!value) return '';
    const found = options.find((opt) => opt.value === value || opt.label === value);
    return found ? found.label : value;
  }, [value, options]);

  const renderIcon = showIcon && Icon;

  return (
    <div ref={containerRef} className={`relative flex-1 w-full ${isOpen ? 'z-50' : 'z-10'}`}>
      {showLabel && (
        <label className="block text-[11px] font-bold text-sky-200/90 uppercase tracking-wider mb-1.5 text-left">
          {labelTitle} <span className="text-red-400">*</span>
        </label>
      )}
      <div className="relative">
        {renderIcon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/90 pointer-events-none z-10" size={18} />
        )}

        <input
          type="text"
          name={nameKey}
          id={nameKey}
          autoComplete="new-password"
          autoCapitalize="off"
          spellCheck="false"
          data-lpignore="true"
          disabled={disabled}
          placeholder={placeholder}
          value={isOpen ? searchQuery : displayValue}
          suppressHydrationWarning
          onFocus={() => {
            if (!disabled) {
              setIsOpen(true);
              setSearchQuery('');
            }
          }}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          className={`w-full bg-white/15 hover:bg-white/20 focus:bg-white/25 border ${
            error ? 'border-red-400 ring-1 ring-red-400' : 'border-white/25'
          } rounded-xl py-3 ${renderIcon ? 'pl-10 sm:pl-12' : 'px-3 sm:px-3.5'} pr-8 sm:pr-9 text-white placeholder-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
        />

        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          suppressHydrationWarning
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-xs cursor-pointer z-10"
        >
          {isOpen ? '▲' : '▼'}
        </button>
      </div>

      {/* Floating Dropdown Options List without scrollbar */}
      {isOpen && !disabled && (
        <div
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          className="absolute top-full left-0 right-0 mt-1.5 z-[100] bg-slate-900/95 border border-white/20 backdrop-blur-xl rounded-xl shadow-2xl max-h-56 overflow-y-auto py-1 text-left text-sm font-sans [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0 animate-fade-in"
        >
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-400 italic">No matches found</div>
          ) : (
            filteredOptions.map((opt, idx) => {
              const isSelected = opt.value === value || opt.label === displayValue;
              return (
                <div
                  key={opt.value + '-' + idx}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className={`px-4 py-2.5 cursor-pointer transition-colors flex items-center justify-between text-xs sm:text-sm font-medium ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-100 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white ml-2 shrink-0" />}
                </div>
              );
            })
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-300 font-medium mt-1.5 ml-1 text-left">{error}</p>
      )}
    </div>
  );
}

/* ─── Main LocationSelector Component ────────────────────────── */
export default function LocationSelector({
  country = 'IN',
  state = '',
  city = '',
  onChange,
  errors = {},
  layout = 'vertical',
  disabled = false,
  showLabels = false,
  showIcons = true,
}) {
  // Memoized Country options
  const countryOptions = useMemo(() => {
    return Country.getAllCountries()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => ({
        value: c.isoCode,
        label: c.flag ? `${c.flag} ${c.name}` : c.name,
        name: c.name,
        phonecode: c.phonecode || '91',
      }));
  }, []);

  // Effective selected country (defaults to India 'IN')
  const activeCountryCode = country || 'IN';

  // Selected Country object
  const selectedCountryObj = useMemo(() => {
    return (
      countryOptions.find(
        (c) => c.value === activeCountryCode || c.name.toLowerCase() === activeCountryCode.toLowerCase()
      ) || countryOptions.find((c) => c.value === 'IN')
    );
  }, [activeCountryCode, countryOptions]);

  const countryCode = selectedCountryObj?.value || 'IN';

  // Notify parent if country was empty on mount so parent state stays synced with calling code
  useEffect(() => {
    if (!country && onChange && selectedCountryObj) {
      onChange({
        country: selectedCountryObj.value,
        countryName: selectedCountryObj.name,
        state: '',
        stateName: '',
        city: '',
        phonecode: selectedCountryObj.phonecode || '91',
      });
    }
  }, [country, onChange, selectedCountryObj]);

  // Memoized State options for selected Country
  const stateOptions = useMemo(() => {
    if (!countryCode) return [];
    return State.getStatesOfCountry(countryCode)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((s) => ({
        value: s.isoCode,
        label: s.name,
        name: s.name,
      }));
  }, [countryCode]);

  // Selected State object
  const selectedStateObj = useMemo(() => {
    if (!state || !stateOptions.length) return null;
    return (
      stateOptions.find(
        (s) => s.value === state || s.name.toLowerCase() === state.toLowerCase()
      ) || null
    );
  }, [state, stateOptions]);

  const stateCode = selectedStateObj?.value || '';

  // Memoized City options for selected State
  const cityOptions = useMemo(() => {
    if (!countryCode || !stateCode) return [];
    const list = City.getCitiesOfState(countryCode, stateCode);
    if (!list || list.length === 0) {
      const fallbackName = selectedStateObj?.name || 'Capital City';
      return [{ value: fallbackName, label: fallbackName, name: fallbackName }];
    }
    const uniqueCities = Array.from(new Set(list.map((c) => c.name))).sort((a, b) =>
      a.localeCompare(b)
    );
    return uniqueCities.map((name) => ({ value: name, label: name, name }));
  }, [countryCode, stateCode, selectedStateObj]);

  // Change Handlers
  const handleCountrySelect = (opt) => {
    onChange({
      country: opt.value,
      countryName: opt.name,
      state: '',
      stateName: '',
      city: '',
      phonecode: opt.phonecode || '91',
    });
  };

  const handleStateSelect = (opt) => {
    onChange({
      country: countryCode,
      countryName: selectedCountryObj?.name || 'India',
      state: opt.value,
      stateName: opt.name,
      city: '',
      phonecode: selectedCountryObj?.phonecode || '91',
    });
  };

  const handleCitySelect = (opt) => {
    onChange({
      country: countryCode,
      countryName: selectedCountryObj?.name || 'India',
      state: stateCode,
      stateName: selectedStateObj?.name || '',
      city: opt.value,
      phonecode: selectedCountryObj?.phonecode || '91',
    });
  };

  const isGrid = layout === 'horizontal' || layout === 'grid';

  return (
    <div className={isGrid ? 'grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3.5 w-full' : 'space-y-2 sm:space-y-3.5 w-full'}>
      {/* 1. Searchable Country Selection */}
      <SearchableSelect
        icon={Globe}
        placeholder="Country"
        labelTitle="Country"
        value={countryCode}
        options={countryOptions}
        onChange={handleCountrySelect}
        disabled={disabled}
        error={errors.country}
        showLabel={showLabels}
        showIcon={showIcons}
        nameKey="search-country-input"
      />

      {/* 2. Searchable State Selection */}
      <SearchableSelect
        icon={Map}
        placeholder="State"
        labelTitle="State"
        value={stateCode}
        options={stateOptions}
        onChange={handleStateSelect}
        disabled={disabled || !countryCode}
        error={errors.state}
        showLabel={showLabels}
        showIcon={showIcons}
        nameKey="search-state-input"
      />

      {/* 3. Searchable City Selection */}
      <SearchableSelect
        icon={MapPin}
        placeholder="City"
        labelTitle="City"
        value={city}
        options={cityOptions}
        onChange={handleCitySelect}
        disabled={disabled || !stateCode}
        error={errors.city}
        showLabel={showLabels}
        showIcon={showIcons}
        nameKey="search-city-input"
      />
    </div>
  );
}
