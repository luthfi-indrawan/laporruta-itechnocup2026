function EmptySection({ text }) {
  return (
    <div className="bg-neo-canvas rounded-xl border-2 border-dashed border-black p-5 text-center">
      <p className="text-sm font-medium text-slate-500">{text}</p>
    </div>
  );
}

export default EmptySection;
