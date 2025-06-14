import React, { useState } from "react";

const Home: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<string>("");

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
        </div>
    )
}

export default Home;