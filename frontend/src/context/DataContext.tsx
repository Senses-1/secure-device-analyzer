// src/context/DataContext.tsx
import { createContext, useState } from "react";
import type { ReactNode } from "react";

type FetchedData = {
  [key: string]: any; // можно уточнить тип, если структура данных известна
};

type DataContextType = {
  data: FetchedData;
  setData: React.Dispatch<React.SetStateAction<FetchedData>>;
};

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<FetchedData>({});

  return (
    <DataContext.Provider value={{ data, setData }}>
      {children}
    </DataContext.Provider>
  );
};
