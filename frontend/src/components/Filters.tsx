import React, { useState } from "react";
import RangeSlider from "./RangeSlider";

const OPTIONS = {
  vendors: ["Vendor A", "Vendor B", "Vendor C"],
  types: ["Type 1", "Type 2", "Type 3"],
  attack_vectors: ["Network", "Adjacent", "Local", "Physical"],
  attack_complexitys: ["Low", "High"],
  privileges_requireds: ["None", "Low", "High"],
  user_interactions: ["None", "Required"],
  scopes: ["Unchanged", "Changed"],
  confidentialitys: ["None", "Low", "High"],
  integritys: ["None", "Low", "High"],
  availabilitys: ["None", "Low", "High"],
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
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>(
    Object.fromEntries(
      Object.keys(OPTIONS).map((key) => [key, []])
    )
  );

  const [baseScores, setBaseScores] = useState<[number, number]>([1, 10]);
  const [exploitabilityScores, setExploitabilityScores] = useState<[number, number]>([1, 10]);
  const [impactScores, setImpactScores] = useState<[number, number]>([1, 10]);

  const handleSubmit = async () => {
    const payload = {
      ...selectedFilters,
      base_scores: baseScores,
      exploitability_scores: exploitabilityScores,
      impact_scores: impactScores,
    };

    try {
      const res = await fetch("/api/filters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log("Response:", data);
    } catch (err) {
      console.error("Ошибка при отправке:", err);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex gap-6">
        {/* Левая колонка: чекбоксы */}
        <div className="w-1/2">
          {Object.entries(OPTIONS).map(([key, options]) => (
            <FilterDropdown
              key={key}
              label={key.replace(/_/g, " ").toUpperCase()}
              options={options}
              selected={selectedFilters[key]}
              setSelected={(val) =>
                setSelectedFilters((prev) => ({ ...prev, [key]: val }))
              }
            />
          ))}
        </div>

        {/* Правая колонка: слайдеры */}
        <div className="w-1/2 space-y-4">
          <RangeSlider
            label="Base Scores"
            min={0.1}
            max={10.0}
            value={baseScores}
            onChange={setBaseScores}
          />
          <RangeSlider
            label="Exploitability Scores"
            min={0.1}
            max={10.0}
            value={exploitabilityScores}
            onChange={setExploitabilityScores}
          />
          <RangeSlider
            label="Impact Scores"
            min={0.1}
            max={10.0}
            value={impactScores}
            onChange={setImpactScores}
          />
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Применить фильтры
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiltersPanel;
