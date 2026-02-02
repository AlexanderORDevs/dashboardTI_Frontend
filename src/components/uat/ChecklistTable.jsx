import { MdCheckCircle, MdCancel } from 'react-icons/md';

export default function ChecklistTable({ rows, handleStatusChange }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[600px] table-auto border border-indigo-300 text-xs sm:text-sm">
        <thead>
          <tr>
            <th className="border border-indigo-300 bg-indigo-100 px-4 py-2 text-center font-sans text-[18px] font-semibold text-black">
              Casos de uso
            </th>
            <th className="border border-indigo-300 bg-indigo-100 px-4 py-2 text-center font-sans text-[18px] font-semibold text-black">
              Criterios de aceptación
            </th>
            <th className="border border-indigo-300 bg-indigo-100 px-4 py-2 text-center font-sans text-[18px] font-semibold text-black">
              Estado
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.useCase}
              className="transition odd:bg-indigo-50 even:bg-indigo-100 hover:bg-indigo-200"
            >
              <td className="border border-indigo-300 px-4 py-3 text-base text-indigo-800">
                {row.useCase}
              </td>
              <td className="border border-indigo-300 px-4 py-3 text-base text-indigo-800">
                {row.criteria}
              </td>
              <td className="border border-indigo-300 px-4 py-3 text-center">
                <button
                  type="button"
                  onClick={() => handleStatusChange(index, true)}
                  className={`text-lg ${
                    row.status === true ? 'text-green-600' : 'text-gray-500'
                  }`}
                >
                  <MdCheckCircle size={24} />
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(index, false)}
                  className={`text-lg ${
                    row.status === false ? 'text-red-600' : 'text-gray-500'
                  }`}
                >
                  <MdCancel size={24} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
