function SectionTitle({ icon, title, count }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="bg-neo-yellow flex h-7 w-7 items-center justify-center rounded-lg border-2 border-black">
        {icon}
      </div>

      <h5 className="font-display text-sm font-black">{title}</h5>

      {count !== undefined && (
        <span className="rounded-full border-2 border-black bg-white px-2 py-0.5 text-[10px] font-black">
          {count}
        </span>
      )}
    </div>
  );
}

export default SectionTitle;
