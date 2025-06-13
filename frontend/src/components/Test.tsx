import React, { useState, useRef, useEffect } from "react";
import RangeSlider from "./RangeSlider";

const Devices = {
    vendors: ["Vendor A", "Vendor B", "Vendor C"],
    types: ["Type 1", "Type 2", "Type 3"],
}

const Exploitability_Metrics = {
    attack_vectors: ["Network", "Adjacent", "Local", "Physical"],
    attack_complexitys: ["Low", "High"],
    privileges_requireds: ["None", "Low", "High"],
    user_interactions: ["None", "Required"],
    scopes: ["Unchanged", "Changed"],
}

const Impact_Metrics = {
    confidentialitys: ["None", "Low", "High"],
    integritys: ["None", "Low", "High"],
    availabilitys: ["None", "Low", "High"],
}

const HoverGroupDropdown = ({
  title,
  items,
  selectedFilters,
  setSelectedFilters,
}: {
  title: string;
  items: Record<string, string[]>;
  selectedFilters: Record<string, string[]>;
  setSelectedFilters: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative w-64" ref={dropdownRef}>
      <div
        className="cursor-pointer font-bold text-center border rounded px-4 py-2 bg-yellow-700 text-white transition"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {title}
      </div>

      {isOpen && (
        <div className="absolute left-0 mt-1 bg-white border rounded shadow-lg p-2 w-64 z-10 max-h-[300px] overflow-y-auto">
          {Object.entries(items).map(([key, values]) => (
            <FilterDropdown
              key={key}
              label={key.replace(/_/g, " ").toUpperCase()}
              options={values}
              selected={selectedFilters[key]}
              setSelected={(val) =>
                setSelectedFilters((prev) => ({ ...prev, [key]: val }))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FilterDropdown = ({
  label,
  options,
  selected,
  setSelected,
}: {
  label: string;
  options: string[];
  selected: string[];
  setSelected: (selected: string[]) => void;
}) => {
  const toggleOption = (option: string) => {
    setSelected(
      selected.includes(option)
        ? selected.filter((o) => o !== option)
        : [...selected, option]
    );
  };

  return (
    <div className="my-4">
      <details className="border rounded p-2">
        <summary className="cursor-pointer font-semibold">{label}</summary>
        <div className="pl-4 pt-2 flex flex-col gap-1">
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggleOption(opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      </details>
    </div>
  );
};

const FiltersPanel = () => {
  const allFilterKeys = [
    ...Object.keys(Devices),
    ...Object.keys(Exploitability_Metrics),
    ...Object.keys(Impact_Metrics),
  ];

  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>(
    Object.fromEntries(allFilterKeys.map((key) => [key, []]))
  );

  return (
    <div className="flex gap-10 p-8 bg-yellow-600 text-black justify-center">
      <HoverGroupDropdown
        title="Devices"
        items={Devices}
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
      />
      <HoverGroupDropdown
        title="Exploitability Metrics"
        items={Exploitability_Metrics}
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
      />
      <HoverGroupDropdown
        title="Impact Metrics"
        items={Impact_Metrics}
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
      />
    </div>
  );
};


export default FiltersPanel;
