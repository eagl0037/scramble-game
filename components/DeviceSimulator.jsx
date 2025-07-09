// DeviceSimulator.jsx
import { useState } from "react";

export default function DeviceSimulator() {
  const [device, setDevice] = useState("Desktop");

  const styles = {
    Desktop: "w-[1280px] h-[800px]",
    Tablet: "w-[768px] h-[1024px]",
    Mobile: "w-[375px] h-[667px]"
  };

  return (
    <div className="bg-[#1e1e1e] text-white p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Device Simulator</h2>
      <div className="mb-4">
        <label className="block mb-2">Select Device</label>
        <select
          value={device}
          onChange={(e) => setDevice(e.target.value)}
          className="bg-[#2a2a2a] text-white px-4 py-2 rounded w-full"
        >
          <option value="Desktop">Desktop</option>
          <option value="Tablet">Tablet</option>
          <option value="Mobile">Mobile</option>
        </select>
      </div>
      <div className="bg-[#333] mx-auto rounded border border-[#444] flex items-center justify-center" style={{ width: styles[device].split(" ")[0], height: styles[device].split(" ")[1] }}>
        <span className="text-accent">{device} View</span>
      </div>
    </div>
  );
}
