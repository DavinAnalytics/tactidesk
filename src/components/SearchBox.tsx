type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

export function SearchBox({ value, onChange, placeholder }: Props) {
  return (
    <label className="search">
      <span className="search-glyph" aria-hidden="true">
        ⌕
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        spellCheck={false}
      />
      {value ? (
        <button type="button" className="search-clear" onClick={() => onChange("")} aria-label="Clear search">
          ×
        </button>
      ) : null}
    </label>
  );
}
