// interface InputProps {
//     children;
//     value;
//     set) => void;
//     min?;
//     max?;
//   }
  
  export function Input({
    value,
    children,
    set,
    min = -200,
    max = 200
  }) {
    return (
      <label>
        <code>{children}</code>
        <input
          value={value}
          type="range"
          min={min}
          max={max}
          onChange={(e) => set(parseFloat(e.target.value))}
        />
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => set(parseFloat(e.target.value) || 0)}
        />
      </label>
    );
  }
  