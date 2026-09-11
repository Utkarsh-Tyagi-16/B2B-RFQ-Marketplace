/**
 * pages/EditRFQPage.jsx — Pre-filled form for buyers to edit an existing RFQ.
 * Fetches the current RFQ data on mount, then submits PUT /api/rfqs/:id.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

const EditRFQPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    productOrServiceName: '',
    description: '',
    quantity: '',
    deliveryLocation: '',
    deadline: '',
    status: 'open',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [fetchError, setFetchError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch the existing RFQ to pre-populate the form
  useEffect(() => {
    const fetchRFQ = async () => {
      try {
        const { data } = await api.get(`/rfqs/${id}`);
        const rfq = data.data.rfq;
        setForm({
          productOrServiceName: rfq.productOrServiceName,
          description: rfq.description,
          quantity: rfq.quantity.toString(),
          deliveryLocation: rfq.deliveryLocation,
          deadline: rfq.deadline.split('T')[0], // Format for date input
          status: rfq.status,
        });
      } catch (err) {
        setFetchError(err.response?.data?.message || 'Failed to load RFQ.');
      } finally {
        setFetching(false);
      }
    };
    fetchRFQ();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!form.productOrServiceName.trim() || form.productOrServiceName.trim().length < 3) {
      newErrors.productOrServiceName = 'Product/service name must be at least 3 characters';
    }
    if (!form.description.trim() || form.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    const qty = parseInt(form.quantity, 10);
    if (!form.quantity || isNaN(qty) || qty < 1) {
      newErrors.quantity = 'Quantity must be a positive number';
    }
    if (!form.deliveryLocation.trim()) {
      newErrors.deliveryLocation = 'Delivery location is required';
    }
    if (!form.deadline) {
      newErrors.deadline = 'Deadline is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');

    try {
      await api.put(`/rfqs/${id}`, {
        ...form,
        quantity: parseInt(form.quantity, 10),
      });
      navigate('/my-rfqs', { state: { successMessage: 'RFQ updated successfully!' } });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update RFQ.';
      const serverErrors = err.response?.data?.errors;
      setApiError(serverErrors ? serverErrors.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Spinner message="Loading RFQ..." />;
  if (fetchError) return <ErrorMessage message={fetchError} />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Edit RFQ</h1>
        <p>Update your request for quotation details.</p>
      </div>

      <div className="form-card">
        {apiError && (
          <div className="form-api-error">
            <span>⚠️</span> {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="edit-productOrServiceName">Product / Service Name *</label>
            <input
              id="edit-productOrServiceName"
              name="productOrServiceName"
              type="text"
              value={form.productOrServiceName}
              onChange={handleChange}
              className={errors.productOrServiceName ? 'input-error' : ''}
            />
            {errors.productOrServiceName && (
              <span className="field-error">{errors.productOrServiceName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="edit-description">Description *</label>
            <textarea
              id="edit-description"
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              className={errors.description ? 'input-error' : ''}
            />
            {errors.description && (
              <span className="field-error">{errors.description}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-quantity">Quantity *</label>
              <input
                id="edit-quantity"
                name="quantity"
                type="number"
                min="1"
                value={form.quantity}
                onChange={handleChange}
                className={errors.quantity ? 'input-error' : ''}
              />
              {errors.quantity && <span className="field-error">{errors.quantity}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="edit-deadline">Deadline *</label>
              <input
                id="edit-deadline"
                name="deadline"
                type="date"
                value={form.deadline}
                onChange={handleChange}
                className={errors.deadline ? 'input-error' : ''}
              />
              {errors.deadline && <span className="field-error">{errors.deadline}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="edit-deliveryLocation">Delivery Location *</label>
            <input
              id="edit-deliveryLocation"
              name="deliveryLocation"
              type="text"
              value={form.deliveryLocation}
              onChange={handleChange}
              className={errors.deliveryLocation ? 'input-error' : ''}
            />
            {errors.deliveryLocation && (
              <span className="field-error">{errors.deliveryLocation}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="edit-status">Status</label>
            <select
              id="edit-status"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/my-rfqs')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              id="edit-rfq-submit"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRFQPage;
