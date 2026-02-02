import { MdEdit } from 'react-icons/md';

export default function DidTable({
  data,
  onEdit,
  getProductName,
  getTesterName,
}) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[600px] table-auto border text-xs sm:text-sm">
        <thead>
          <tr>
            <th className="border px-4 py-2">Name Register</th>
            <th className="border px-4 py-2">Contact</th>
            <th className="border px-4 py-2">DID</th>
            <th className="border px-4 py-2">User</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Mode</th>
            <th className="border px-4 py-2">Tester</th>
            <th className="border px-4 py-2">Product</th>
            <th className="border px-4 py-2">CPA/CPL</th>
            <th className="border px-4 py-2">DID Date</th>
            <th className="border px-4 py-2">Creation Date</th>
            <th className="border px-4 py-2">Observations</th>
            <th className="border px-4 py-2">Edit</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={13} className="py-4 text-center">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row.id || idx}>
                <td className="border px-4 py-2">{row.nameRegister}</td>
                <td className="border px-4 py-2">{row.contact}</td>
                <td className="border px-4 py-2">{row.did}</td>
                <td className="border px-4 py-2">{row.user}</td>
                <td className="border px-4 py-2">{row.status}</td>
                <td className="border px-4 py-2">{row.mode}</td>
                <td className="border px-4 py-2">
                  {getTesterName(row.testerId)}
                </td>
                <td className="border px-4 py-2">
                  {getProductName(row.idProduct)}
                </td>
                <td className="border px-4 py-2">{row.cpaCpl}</td>
                <td className="border px-4 py-2">{row.didDate}</td>
                <td className="border px-4 py-2">{row.created_at || ''}</td>
                <td className="border px-4 py-2">{row.observations}</td>
                <td className="border px-4 py-2 text-center">
                  <button
                    type="button"
                    className="text-indigo-600 hover:text-indigo-900"
                    onClick={() => onEdit(row)}
                    title="Editar"
                  >
                    <MdEdit size={20} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
