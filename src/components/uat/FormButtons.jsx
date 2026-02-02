export default function FormButtons({ isEditing, onCancel, className = '' }) {
  return (
    <div className={`flex ${className} justify-end gap-4`}>
      <button
        type="submit"
        className="w-full rounded-md border-4 border-indigo-600 bg-indigo-600 px-4 py-2 text-base font-semibold text-white shadow-lg transition hover:bg-indigo-700 sm:w-auto"
      >
        {isEditing ? 'Update' : 'Save'}
      </button>
      <button
        type="button"
        className="w-full rounded-md border-4 border-pink-400 bg-pink-100 px-4 py-2 text-base font-semibold text-pink-900 shadow-lg transition hover:bg-pink-200 sm:w-auto"
        onClick={onCancel}
      >
        Cancel
      </button>
    </div>
  );
}
