import { ArrowPathIcon } from '@heroicons/react/24/solid';

export default function FormButtons({
  onCancel,
  isLoading = false,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <button
        type="submit"
        disabled={isLoading}
        className={`
          flex w-full max-w-xs items-center justify-center gap-2
          rounded-md border-4 px-6 py-3 text-[22px] font-semibold shadow-lg transition
          ${
            isLoading
              ? 'cursor-not-allowed border-gray-400 bg-gray-400 text-white'
              : 'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700'
          }
        `}
      >
        {isLoading ? (
          <>
            <ArrowPathIcon className="h-6 w-6 animate-spin" />
            Sending...
          </>
        ) : (
          'Submit'
        )}
      </button>

      <button
        type="button"
        disabled={isLoading}
        className={`
          w-full max-w-xs rounded-md border-4 px-6 py-3 text-[22px] font-semibold shadow-lg transition
          ${
            isLoading
              ? 'cursor-not-allowed border-pink-200 bg-pink-50 text-pink-300'
              : 'border-pink-400 bg-pink-100 text-pink-900 hover:bg-pink-200'
          }
        `}
        onClick={onCancel}
      >
        Clear All
      </button>
    </div>
  );
}
