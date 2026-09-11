/**
 * components/ErrorMessage.jsx — Displays API or form error messages.
 * Shown when a fetch fails or the backend returns an error response.
 */

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="error-message-box">
      <span className="error-icon">⚠️</span>
      <p>{message || 'Something went wrong. Please try again.'}</p>
      {onRetry && (
        <button className="btn btn-outline btn-sm" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
