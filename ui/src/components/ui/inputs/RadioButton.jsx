const RadioButton = ({ label, name, value, selected, onChange }) => (
  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
    <input
      type="radio"
      name={name}
      value={value}
      checked={selected === value}
      onChange={(e) => onChange(e.target.value)}
      className="h-4 w-4 border-gray-300 text-orange-500 focus:ring-1 focus:ring-orange-300"
    />
    {label}
  </label>
);

export default RadioButton;
