const Table = ({
  columns,
  renderRow,
  data,
}: {
  columns: { header: string; accessor: string; className?: string }[];
  renderRow: (item: any) => React.ReactNode;
  data: any[];
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-md overflow-hidden">
      <table className="w-full mt-4 font-sans">
      <thead>
          <tr className="text-left text-gray-500 dark:text-gray-400 text-sm border-b border-gray-200 dark:border-gray-700">
          {columns.map((col) => (
              <th key={col.accessor} className={`py-3 font-medium ${col.className}`}>{col.header}</th>
          ))}
        </tr>
      </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{data.map((item) => renderRow(item))}</tbody>
    </table>
    </div>
  );
};

export default Table;
