/**
 * components/EmptyState.jsx — Friendly empty state illustration + message.
 * Shown when a list fetch succeeds but returns 0 items.
 */

const EmptyState = ({ icon = '📭', title, message, action }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {message && <p className="empty-state-message">{message}</p>}
      {action && (
        <div className="empty-state-action">{action}</div>
      )}
    </div>
  );
};

export default EmptyState;
