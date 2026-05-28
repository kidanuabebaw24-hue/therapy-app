import "./Table.css";

const Table = ({ columns, data, onAction, actions, emptyMessage = 'No users found' }) => {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.header}</th>
            ))}
            {actions && actions.length > 0 && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex}>
                  {column.render ? column.render(row) : row[column.accessor]}
                </td>
              ))}
              {actions && actions.length > 0 && (
                <td className="actions-cell">
                  {actions.map((action, index) => {
                    // Check if the action has a condition and evaluate it
                    if (action.condition && !action.condition(row)) {
                      return null; // Don't render if condition fails
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => onAction?.(action.name, row)}
                        className={`action-btn ${action.className || ""}`}
                        title={action.label}
                      >
                        {action.icon}
                      </button>
                    );
                  })}
                </td>
              )}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + (actions?.length ? 1 : 0)}
                className="empty-state"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
