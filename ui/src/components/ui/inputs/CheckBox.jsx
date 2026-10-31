const Checkbox = ({ label, checked, onChange }) => (
  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 rounded-sm border-gray-300 text-orange-500 focus:ring-1 focus:ring-orange-300"
    />
    {label}
  </label>
);

export default Checkbox;
