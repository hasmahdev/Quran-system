import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

/**
 * A reusable filterable dropdown component for selecting a class.
 *
 * @param {object[]} items - Array of items to display in the dropdown.
 * @param {object} selectedItem - The currently selected item.
 * @param {function} onSelectItem - Callback function when an item is selected.
 * @param {string} label - The property to display for each item.
 * @param {string} [placeholder='Select an item'] - Placeholder text for the dropdown.
 * @param {boolean} [disabled=false] - Whether the dropdown is disabled.
 */
const FilterableDropdown = ({ items, selectedItem, onSelectItem, label, placeholder = 'Select an item', disabled = false }: { items: any[], selectedItem: any, onSelectItem: (item: any) => void, label: string, placeholder?: string, disabled?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredItems = items.filter((item) =>
    item[label].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (item: any) => {
    onSelectItem(item);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative w-full" ref={dropdownRef} dir="rtl">
      <button
        type="button"
        className="w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm ps-3 pe-10 py-2 text-right cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-white flex justify-between items-center"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span>{selectedItem ? selectedItem[label] : placeholder}</span>
        <ChevronDown className={`h-5 w-5 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-gray-800 shadow-lg rounded-md border border-gray-700 max-h-60 overflow-auto">
          <div className="p-2">
            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder={`ابحث عن ${placeholder}...`}
                className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 ps-10 pe-3 text-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          <ul className="py-1">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <li
                  key={item.id}
                  className="text-white cursor-pointer select-none relative py-2 px-4 hover:bg-gray-700"
                  onClick={() => handleSelect(item)}
                >
                  {item[label]}
                </li>
              ))
            ) : (
              <li className="text-gray-500 text-center py-2 px-4">لا توجد نتائج</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FilterableDropdown;
