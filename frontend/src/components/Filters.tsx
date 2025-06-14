import React, { useState, useRef, useEffect } from "react";
import RangeSlider from "./RangeSlider";

const Devices = {
  vendor: [
    { label: "Cisco", value: "Cisco" },
    { label: "HPE", value: "Hpe" },
    { label: "Huawei", value: "Huawei" },
    { label: "Juniper", value: "Juniper" },
    { label: "MikroTik", value: "Mikrotik" },
  ],
  type: [
    { label: "Access Point", value: "access-point" },
    { label: "Controller", value: "controller" },
    { label: "Firewall", value: "firewall" },
    { label: "Router", value: "router" },
    { label: "Switch", value: "switch" },
  ],
};

const Exploitability_Metrics = {
  attack_vector: [
    { label: "Network", value: "N" },
    { label: "Adjacent", value: "A" },
    { label: "Local", value: "L" },
    { label: "Physical", value: "P" },
  ],
  attack_complexity: [
    { label: "Low", value: "L" },
    { label: "High", value: "H" },
  ],
  privileges_required: [
    { label: "None", value: "N" },
    { label: "Low", value: "L" },
    { label: "High", value: "H" },
  ],
  user_interaction: [
    { label: "None", value: "N" },
    { label: "Required", value: "R" },
  ],
  scope: [
    { label: "Unchanged", value: "U" },
    { label: "Changed", value: "C" },
  ],
};

const Impact_Metrics = {
  confidentiality: [
    { label: "None", value: "N" },
    { label: "Low", value: "L" },
    { label: "High", value: "H" },
  ],
  integrity: [
    { label: "None", value: "N" },
    { label: "Low", value: "L" },
    { label: "High", value: "H" },
  ],
  availability: [
    { label: "None", value: "N" },
    { label: "Low", value: "L" },
    { label: "High", value: "H" },
  ],
};

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
  items: Record<string, { label: string; value: string }[]>;
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
              selected={selectedFilters[key] || []}
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
  options: { label: string; value: string }[];
  selected: string[];
  setSelected: (selected: string[]) => void;
}) => {
  const toggleOption = (option: string) => {
    console.log(option);
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
          {options.map(({ label, value }) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selected.includes(value)}
                onChange={() => toggleOption(value)}
              />
              {label}
            </label>
          ))}
        </div>
      </details>
    </div>
  );
};

const FiltersPanel = () => {
    const getInitialSelectedFilters = (): Record<string, string[]> => {
    return {
        ...Object.fromEntries(
        Object.entries(Devices).map(([key, values]) => [key, values.map((v) => v.value)])
        ),
        ...Object.fromEntries(
        Object.entries(Exploitability_Metrics).map(([key, values]) => [key, values.map((v) => v.value)])
        ),
        ...Object.fromEntries(
        Object.entries(Impact_Metrics).map(([key, values]) => [key, values.map((v) => v.value)])
        ),
    };
    };

    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>(
    getInitialSelectedFilters()
    );

    const [baseScores, setBaseScores] = useState<[number, number]>([0.0, 10.0]);
    const [exploitabilityScores, setExploitabilityScores] = useState<[number, number]>([0.0, 10.0]);
    const [impactScores, setImpactScores] = useState<[number, number]>([0.0, 10.0]);

    const fetchAndLog = (url: string, label: string) => {
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          console.log(`📊 Ответ с бэка (${label}):`, data);
          // Место для дальнейшей обработки, если нужно
        })
        .catch((err) => console.error(`❌ Ошибка запроса (${label}):`, err));
    };

    const applyFilters = () => {
      const params = new URLSearchParams();

      // Добавляем числовые диапазоны
      params.append("base_score_min", String(baseScores[0]));
      params.append("base_score_max", String(baseScores[1]));
      params.append("exploitability_score_min", String(exploitabilityScores[0]));
      params.append("exploitability_score_max", String(exploitabilityScores[1]));
      params.append("impact_score_min", String(impactScores[0]));
      params.append("impact_score_max", String(impactScores[1]));

      // Добавляем фильтры
      for (const [key, values] of Object.entries(selectedFilters)) {
        values.forEach((value) => {
          // Учитываем Django-совместную нотацию массива: field[]=value
          params.append(`${key}[]`, value);
        });
      }

      // ⬅️ Выводим в консоль всё, что отправим
      console.log("➡️ Отправляемые параметры:");
      for (const [key, value] of params.entries()) {
        console.log(`${key} = ${value}`);
      }

      // Список конечных точек
      const endpoints = [
        { url: "/vulnerabilities/count_vulnerabilities_by_vendor/", label: "по вендорам" },
        { url: "/vulnerabilities/count_vulnerabilities_by_type/", label: "по типам устройств" },
        { url: "/vulnerabilities/top_10_devices_by_base_score/", label: "топ 10" },
        // можно добавлять новые эндпоинты здесь
      ];

      // Запускаем все fetch-запросы
      endpoints.forEach(({ url, label }) => {
        fetchAndLog(`${url}?${params.toString()}`, label);
        });
      };

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
            onClick={applyFilters}
            className="font-bold text-center border border-white rounded px-4 py-2 w-64 bg-gradient-to-br from-yellow-600 to-yellow-800 text-white hover:from-yellow-700 hover:to-yellow-900 transition shadow-md hover:shadow-lg"
            >
            Apply filters
            </button>
        </div>
    );
};


export default FiltersPanel;
