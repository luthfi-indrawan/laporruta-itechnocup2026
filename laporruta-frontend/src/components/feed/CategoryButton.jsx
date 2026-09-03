export function CategoryButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-lg border-2 border-black px-3 py-1.5 text-xs font-bold transition-colors ${
        active ? 'bg-black text-white' : 'hover:bg-neo-canvas bg-white'
      } `}
    >
      {children}
    </button>
  );
}
