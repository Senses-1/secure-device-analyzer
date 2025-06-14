import React, { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { useContext } from "react";
import { DataContext } from "../context/DataContext";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"];

const Home: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<string>("");
    const { data } = useContext(DataContext)!;

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
    ([name, value]) => ({ name, value })
    );

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
            {vendorData.length > 0 && (
                <div className="mt-10">
                <h2 className="text-lg font-semibold mb-4">Уязвимости по вендорам</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                    <Pie
                        data={vendorData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label
                    >
                        {vendorData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                    </PieChart>
                </ResponsiveContainer>
                </div>
            )}
        </div>
    )
}

export default Home;