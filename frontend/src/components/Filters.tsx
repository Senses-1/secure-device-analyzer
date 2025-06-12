import React, { useEffect, useState } from "react";

type FilterData = {
    devices: string[];
    vendors: string[];
    types: string[];
    base_severities: string[];
    base_scores: number[];
    exploitability_scores: number[];
    impact_scores: number[];
    attack_vectors: string[];
    attack_complexitys: string[];
    privileges_requireds: string[];
    user_interactions: string[];
    scopes: string[];
    confidentialitys: string[];
    integritys: string[];
    availabilitys: string[];
};

const Filters: React.FC = () => {
  const [filters, setFilters] = useState<FilterData | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  useEffect(() => {
    fetch("/vulnerabilities/get_filter_options/")
      .then((res) => res.json())
      .then((data) => setFilters(data))
      .catch((err) => console.error("Ошибка загрузки фильтров:", err));
  }, []);

  const handleSelect = (category: string, values: string[]) => {
    setSelectedFilters((prev) => ({ ...prev, [category]: values }));
  };

  const renderSelect = (label: string, items: string[] | number[]) => (
    <div key={label} className="mb-4">
      <label className="block mb-1 font-medium">{label}</label>
      <select
        multiple
        className="w-full border border-gray-300 rounded p-2"
        onChange={(e) =>
          handleSelect(
            label,
            Array.from(e.target.selectedOptions).map((opt) => opt.value)
          )
        }
      >
        {items.map((item) => (
          <option key={item} value={String(item)}>
            {String(item)}
          </option>
        ))}
      </select>
    </div>
  );

  if (!filters) return <div>Загрузка фильтров...</div>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Фильтры</h2>
      {Object.entries(filters).map(([label, items]) => renderSelect(label, items))}

      
        {/* Кнопка "Применить фильтры" */}
        <button
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => {
            console.log("Применить фильтры", selectedFilters);
            // TODO: fetch('/vulnerabilities/filter?' + new URLSearchParams(...))
        }}
        >
        Применить фильтры
        </button>
    </div>
  );
};

export default Filters;
