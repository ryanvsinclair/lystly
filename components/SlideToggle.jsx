"use client";

export function SlideToggle({
  value,
  options,
  onChange,
  className = "",
  ariaLabel,
  tablist = false,
}) {
  const index = options.findIndex((option) => option.id === value);

  return (
    <div
      className={["slide-well", className].filter(Boolean).join(" ")}
      data-index={String(index)}
      role={tablist ? "tablist" : "group"}
      aria-label={ariaLabel}
      style={{ "--slots": String(options.length) }}
    >
      <b className="slide-lid" aria-hidden="true" hidden={index < 0}></b>
      {options.map((option) => {
        const on = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            className={on ? "is-active" : undefined}
            role={tablist ? "tab" : undefined}
            aria-pressed={tablist ? undefined : on}
            aria-selected={tablist ? on : undefined}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
