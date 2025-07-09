// Sidebar.jsx
export default function Sidebar({ setView }) {
  return (
    <aside className="bg-[#1a1a1a] w-60 h-screen p-4 shadow-lg">
      <h2 className="text-xl font-bold text-accent mb-6">QRSEC Menu</h2>
      <nav className="space-y-3">
        <button
          className="w-full text-left px-3 py-2 rounded hover:bg-[#2a2a2a]"
          onClick={() => setView("dashboard")}
        >
          Dashboard
        </button>
        <button
          className="w-full text-left px-3 py-2 rounded hover:bg-[#2a2a2a]"
          onClick={() => setView("cursor")}
        >
          Cursor Config
        </button>
        <button
          className="w-full text-left px-3 py-2 rounded hover:bg-[#2a2a2a]"
          onClick={() => setView("device")}
        >
          Device Simulator
        </button>
      </nav>
    </aside>
  );
}
