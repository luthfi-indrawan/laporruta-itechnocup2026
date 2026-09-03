function InfoBox({ icon, label, value }) {
  return (
    <div className="bg-neo-canvas rounded-xl border-2 border-black p-3">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}

        <span className="text-[10px] font-black tracking-wide uppercase">{label}</span>
      </div>

      <p className="mt-2 truncate text-sm font-black">{value}</p>
    </div>
  );
}

export default InfoBox;
