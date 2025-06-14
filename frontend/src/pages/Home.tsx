import React, { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { useContext } from "react";
import { DataContext } from "../context/DataContext";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"];

type Top10Table = {
  top: { device: string; avg_base_score: string }[];
  bottom: { device: string; avg_base_score: string }[];
};

const Home: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<string>("");
    const { data } = useContext(DataContext)!;
    const top10 = data["top_10"] as Record<string, Top10Table>;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
        setFile(e.target.files[0]);
        }
    };

    const uploadFile = async () => {
        if (!file) {
        setStatus("Пожалуйста, выберите файл.");
        return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
        const res = await fetch("/vulnerabilities/upload_csv/", {
            method: "POST",
            body: formData,
        });
        const data = await res.json();
        setStatus(data.message || data.error || "Готово");
        } catch (error) {
        console.error(error);
        setStatus("Ошибка при загрузке файла.");
        }
    };

    const vendorData = Object.entries(data["vuln_by_vendor"] || {}).map(
    ([name, value]) => ({ name, value: Number(value) })
    );

    const filteredVendorData = vendorData.filter((item) => item.value > 0);

    const typeData = Object.entries(data["vuln_by_type"] || {}).map(
    ([name, value]) => ({ name, value: Number(value) })
    );

    const filteredTypeData = typeData.filter((item) => item.value > 0);

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Загрузка CSV</h1>

            {/* Загрузка CSV */}
            <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="mb-2"
            />
            <br />
            <button
            onClick={uploadFile}
            className="bg-blue-500 text-white px-4 py-2 rounded"
            >
            Загрузить
            </button>

            <p className="mt-4 text-sm text-gray-700">{status}</p>

            {/* Пирог */}
            {filteredVendorData.length > 0 && (
                <div className="mt-10">
                    <h2 className="text-lg font-semibold mb-4">Уязвимости по вендорам</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                        <Pie
                            data={filteredVendorData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            label
                        >
                            {filteredVendorData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
            {/* Пирог */}
            {filteredTypeData.length > 0 && (
                <div className="mt-10">
                    <h2 className="text-lg font-semibold mb-4">Уязвимости по типам</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                        <Pie
                            data={filteredTypeData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            label
                        >
                            {filteredTypeData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
            
            {top10 && Object.entries(top10).map(([deviceType, { top, bottom }]) => {
            const maxLength = Math.max(top.length, bottom.length);
            const topList = [...top, ...Array(maxLength - top.length).fill(null)];
            const bottomList = [...bottom, ...Array(maxLength - bottom.length).fill(null)];

            const isTopEmpty = top.length === 0;
            const isBottomEmpty = bottom.length === 0;

            return (
                <div key={deviceType} className="mt-10">
                    <h2 className="text-lg font-bold capitalize mb-2">{deviceType.replace(/-/g, " ")}</h2>
                    <div className="flex gap-4 w-full">
                        {!isBottomEmpty && (
                        <div className={`border rounded w-full ${isTopEmpty ? "col-span-2" : ""}`}>
                            <h3 className="bg-gray-200 px-4 py-2 text-center font-semibold">Recommended devices</h3>
                            <table className="w-full table-fixed">
                            <thead>
                                <tr className="bg-gray-100">
                                <th className="text-left px-4 py-2 w-1/12">#</th>
                                <th className="text-left px-4 py-2 w-2/3">Device</th>
                                <th className="text-left px-4 py-2 w-1/3">Avg Base Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bottomList.map((item, index) => (
                                <tr key={index} className="odd:bg-white even:bg-gray-50">
                                    <td className="px-4 py-2">{index + 1}</td>
                                    <td className="px-4 py-2">{item?.device || ""}</td>
                                    <td className="px-4 py-2">{item?.avg_base_score ?? ""}</td>
                                </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                        )}
                        {!isTopEmpty && (
                        <div className={`border rounded w-full ${isBottomEmpty ? "col-span-2" : ""}`}>
                            <h3 className="bg-gray-200 px-4 py-2 text-center font-semibold">Not recommended devices</h3>
                            <table className="w-full table-fixed">
                            <thead>
                                <tr className="bg-gray-100">
                                <th className="text-left px-4 py-2 w-1/12">#</th>
                                <th className="text-left px-4 py-2 w-2/3">Device</th>
                                <th className="text-left px-4 py-2 w-1/3">Avg Base Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topList.map((item, index) => (
                                <tr key={index} className="odd:bg-white even:bg-gray-50">
                                    <td className="px-4 py-2">{index + 1}</td>
                                    <td className="px-4 py-2">{item?.device || ""}</td>
                                    <td className="px-4 py-2">{item?.avg_base_score ?? ""}</td>
                                </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                        )}
                    </div>
                </div>
            );
            })}
        </div>
    )
}

export default Home;