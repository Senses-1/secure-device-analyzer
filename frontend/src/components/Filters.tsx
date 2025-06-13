import React, { useState, useRef, useEffect } from "react";
import RangeSlider from "./RangeSlider";

const Devices = {
    vendor: ["Vendor A", "Vendor B", "Vendor C"],
    type: ["Type 1", "Type 2", "Type 3"],
}

const Exploitability_Metrics = {
    attack_vector: ["Network", "Adjacent", "Local", "Physical"],
    attack_complexity: ["Low", "High"],
    privileges_required: ["None", "Low", "High"],
    user_interaction: ["None", "Required"],
    scope: ["Unchanged", "Changed"],
}

const Impact_Metrics = {
    confidentiality: ["None", "Low", "High"],
    integrity: ["None", "Low", "High"],
    availability: ["None", "Low", "High"],
}

const HoverGroupDropdown = ({
  title,
  items,
  selectedFilters,
  setSelectedFilters,
  sliderValue,
  setSliderValue,
  sliderLabel,
}: {
  title: string;
  items: Record<string, string[]>;
  selectedFilters: Record<string, string[]>;
  setSelectedFilters: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  sliderValue: [number, number];
  setSliderValue: (val: [number, number]) => void;
  sliderLabel: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        <div className="absolute left-0 mt-1 bg-white border rounded shadow-lg p-2 w-64 z-10 max-h-[400px] overflow-y-auto">
          {/* Фильтры */}
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
        {/* Добавляем слайдер */}
          <RangeSlider
            label={sliderLabel}
            min={0}
            max={10}
            value={sliderValue}
            onChange={setSliderValue}
          />
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

    const getInitialSelectedFilters = (): Record<string, string[]> => {
    return {
        ...Object.fromEntries(
        Object.entries(Devices).map(([key, values]) => [key, [...values]])
        ),
        ...Object.fromEntries(
        Object.entries(Exploitability_Metrics).map(([key, values]) => [key, [...values]])
        ),
        ...Object.fromEntries(
        Object.entries(Impact_Metrics).map(([key, values]) => [key, [...values]])
        ),
    };
    };

    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>(
    getInitialSelectedFilters()
    );

    const [baseScores, setBaseScores] = useState<[number, number]>([0.0, 10.0]);
    const [exploitabilityScores, setExploitabilityScores] = useState<[number, number]>([0.0, 10.0]);
    const [impactScores, setImpactScores] = useState<[number, number]>([0.0, 10.0]);

    return (
        <div className="flex gap-10 p-4 bg-yellow-600 text-black w-full">
            <HoverGroupDropdown
            title="Devices"
            items={Devices}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            sliderValue={baseScores}
            setSliderValue={setBaseScores}
            sliderLabel="Base Score"
            />
            <HoverGroupDropdown
            title="Exploitability Metrics"
            items={Exploitability_Metrics}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            sliderValue={exploitabilityScores}
            setSliderValue={setExploitabilityScores}
            sliderLabel="Exploitability Score"
            />
            <HoverGroupDropdown
            title="Impact Metrics"
            items={Impact_Metrics}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            sliderValue={impactScores}
            setSliderValue={setImpactScores}
            sliderLabel="Impact Score"
            />
            <button
            className="font-bold text-center border border-white rounded px-4 py-2 w-64 bg-gradient-to-br from-yellow-600 to-yellow-800 text-white hover:from-yellow-700 hover:to-yellow-900 transition shadow-md hover:shadow-lg"
            >
            Применить фильтры
            </button>
        </div>
    );
};


export default FiltersPanel;
