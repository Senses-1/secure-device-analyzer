import React, { useRef, useState, useEffect } from "react";

interface CustomSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (val: [number, number]) => void;
  label?: string;
}

const CustomSlider: React.FC<CustomSliderProps> = ({ min, max, value, onChange, label }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<null | "min" | "max">(null);
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);

  useEffect(() => {
    onChange([minVal, maxVal]);
  }, [minVal, maxVal, onChange]);

  const handleMouseMove = (e: MouseEvent) => {
    if (!trackRef.current || !dragging) return;
    const rect = trackRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const val = parseFloat((min + percent * (max - min)).toFixed(1));
    if (dragging === "min") {
      const newVal = Math.min(Math.max(min, val), maxVal - 0.1);
      setMinVal(parseFloat(newVal.toFixed(1)));
    } else {
      const newVal = Math.max(Math.min(max, val), minVal + 0.1);
      setMaxVal(parseFloat(newVal.toFixed(1)));
    }
  };

  const handleMouseUp = () => setDragging(null);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  });

  const calcPercent = (val: number) => ((val - min) / (max - min)) * 100;

    return (
    <div className="w-full max-w-md px-4 py-4">
        {label && (
        <div className="text-center mb-2 text-sm font-medium text-gray-700">
            {label}
        </div>
        )}
        <div className="flex items-center gap-4">
            <div className="flex-1">
                <div ref={trackRef} className="relative h-2 bg-gray-300 rounded">
                <div
                    className="absolute h-2 bg-blue-500 rounded"
                    style={{
                    left: `${calcPercent(minVal)}%`,
                    width: `${calcPercent(maxVal) - calcPercent(minVal)}%`,
                    }}
                ></div>
                {/* Min Thumb */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border border-gray-400 rounded-full cursor-pointer z-10"
                    style={{ left: `calc(${calcPercent(minVal)}% - 8px)` }}
                    onMouseDown={() => setDragging("min")}
                ></div>
                {/* Max Thumb */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border border-gray-400 rounded-full cursor-pointer z-10"
                    style={{ left: `calc(${calcPercent(maxVal)}% - 8px)` }}
                    onMouseDown={() => setDragging("max")}
                ></div>
                </div>
                <div className="flex justify-between text-sm mt-2">
                <span>{minVal.toFixed(1)}</span>
                <span>{maxVal.toFixed(1)}</span>
                </div>
            </div>
        </div>
    </div>
    );
};

export default CustomSlider;
