import { MdEdit } from 'react-icons/md';

export default function LandingTable({
  data,
  onEdit,
  getProductName,
  getDomainName,
  getTesterName,
}) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[600px] table-auto border text-xs sm:text-sm">
        <thead>
          <tr>
            <th className="border px-4 py-2">Name Register</th>
            <th className="border px-4 py-2">User</th>
            <th className="border px-4 py-2">Product</th>
            <th className="border px-4 py-2">Domain Name</th>
            <th className="border px-4 py-2">URL Landing</th>
            <th className="border px-4 py-2">Tester</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Test Type</th>
            <th className="border px-4 py-2">Creation Date</th>
            <th className="border px-4 py-2">Observations</th>
            <th className="border px-4 py-2">Edit</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={11} className="py-4 text-center">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row.id || idx}>
                <td className="border px-4 py-2">{row.nameRegister}</td>
                <td className="border px-4 py-2">{row.user}</td>
                <td className="border px-4 py-2">
                  {getProductName(row.idProduct)}
                </td>
                <td className="border px-4 py-2">
                  {getDomainName(row.idDomain)}
                </td>
                <td className="max-w-[280px] truncate border px-4 py-2">
                  {row.urlLanding ? (
                    <a
                      href={row.urlLanding}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                      title={row.urlLanding}
                      style={{
                        display: 'inline-block',
                        maxWidth: '280px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        verticalAlign: 'bottom',
                      }}
                    >
                      {row.urlLanding}
                    </a>
                  ) : (
                    ''
                  )}
                </td>
                <td className="border px-4 py-2">
                  {getTesterName(row.testerId)}
                </td>
                <td className="border px-4 py-2">{row.status}</td>
                <td className="border px-4 py-2">{row.testType}</td>
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
