/**
 * components/Spinner.jsx — Simple centered loading spinner.
 * Used during API calls to give users feedback while data is loading.
 */

const Spinner = ({ message = 'Loading...' }) => {
  return (
    <div className="spinner-container">
      <div className="spinner" />
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
};

export default Spinner;
