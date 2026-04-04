"use client";

interface ForkSliderProps {
  slug: string;
  label: string;
  currentValue: number;
  onChange: (value: number) => void;
}

export default function ForkSlider({
  slug,
  label,
  currentValue,
  onChange,
}: ForkSliderProps) {
  const displayPct = Math.round(currentValue * 100);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = Number(e.target.value);
    onChange(raw / 100);
  }

  return (
    <div
      className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4 space-y-3"
      data-slug={slug}
    >
      {/* Label row */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={`fork-slider-${slug}`}
          className="text-[13px] font-medium text-[var(--text-secondary)] uppercase tracking-wider"
        >
          {label}
        </label>
        <span
          className="text-[32px] font-bold leading-none number-display"
          style={{ color: "var(--accent-purple)" }}
        >
          {displayPct}
          <span className="text-[14px] font-normal text-[var(--text-tertiary)] ml-0.5">
            %
          </span>
        </span>
      </div>

      {/* Slider track */}
      <div className="relative">
        <input
          id={`fork-slider-${slug}`}
          type="range"
          min={0}
          max={100}
          value={displayPct}
          onChange={handleChange}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--accent-purple) ${displayPct}%, var(--border-primary) ${displayPct}%)`,
            accentColor: "var(--accent-purple)",
          }}
        />
        {/* Tick marks at 0, 25, 50, 75, 100 */}
        <div className="flex justify-between mt-1 px-0.5">
          {[0, 25, 50, 75, 100].map((tick) => (
            <span
              key={tick}
              className="text-[10px] text-[var(--text-tertiary)]"
            >
              {tick}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
