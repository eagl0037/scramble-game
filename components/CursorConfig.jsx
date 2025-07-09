// CursorConfig.jsx
import { useState } from "react";

export default function CursorConfig() {
  const [cursorVersion, setCursorVersion] = useState("1.0");

  return (
    <div className="bg-[#1e1e1e] text-white p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Cursor Configuration</h2>
      <label className="block mb-2">Cursor Version</label>
      <input
        type="text"
        value={cursorVersion}
        onChange={(e) => setCursorVersion(e.target.value)}
        className="bg-[#2a2a2a] text-white px-4 py-2 rounded w-full"
      />
      <button
        onClick={() => alert(`Cursor updated to version ${cursorVersion}`)}
        className="mt-4 bg-accent px-4 py-2 rounded text-white"
      >
        Save Config
      </button>
    </div>
  );
}
