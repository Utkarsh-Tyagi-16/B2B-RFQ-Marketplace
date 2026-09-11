/**
 * pages/CreateRFQPage.jsx — Form for buyers to post a new RFQ.
 * Validates all fields client-side before submitting to POST /api/rfqs.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateRFQPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    productOrServiceName: '',
    description: '',
    quantity: '',
    deliveryLocation: '',
    deadline: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  // Client-side validation mirrors backend rules for instant feedback
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
    } else if (new Date(form.deadline) <= new Date()) {
      newErrors.deadline = 'Deadline must be a future date';
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
      await api.post('/rfqs', {
        ...form,
        quantity: parseInt(form.quantity, 10),
      });
      navigate('/my-rfqs', { state: { successMessage: 'RFQ posted successfully!' } });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create RFQ. Please try again.';
      const serverErrors = err.response?.data?.errors;
      setApiError(serverErrors ? serverErrors.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  // Tomorrow's date as the minimum selectable deadline
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Post New RFQ</h1>
        <p>Describe what you need and let suppliers compete for your business.</p>
      </div>

      <div className="form-card">
        {apiError && (
          <div className="form-api-error">
            <span>⚠️</span> {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="productOrServiceName">Product / Service Name *</label>
            <input
              id="productOrServiceName"
              name="productOrServiceName"
              type="text"
              placeholder="e.g. Industrial Steel Bolts M10"
              value={form.productOrServiceName}
              onChange={handleChange}
              className={errors.productOrServiceName ? 'input-error' : ''}
            />
            {errors.productOrServiceName && (
              <span className="field-error">{errors.productOrServiceName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Describe the specifications, requirements, quality standards, etc."
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
              <label htmlFor="quantity">Quantity *</label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                placeholder="e.g. 500"
                value={form.quantity}
                onChange={handleChange}
                className={errors.quantity ? 'input-error' : ''}
              />
              {errors.quantity && <span className="field-error">{errors.quantity}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="deadline">Submission Deadline *</label>
              <input
                id="deadline"
                name="deadline"
                type="date"
                min={minDate}
                value={form.deadline}
                onChange={handleChange}
                className={errors.deadline ? 'input-error' : ''}
              />
              {errors.deadline && <span className="field-error">{errors.deadline}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="deliveryLocation">Delivery Location *</label>
            <input
              id="deliveryLocation"
              name="deliveryLocation"
              type="text"
              placeholder="e.g. Mumbai, Maharashtra, India"
              value={form.deliveryLocation}
              onChange={handleChange}
              className={errors.deliveryLocation ? 'input-error' : ''}
            />
            {errors.deliveryLocation && (
              <span className="field-error">{errors.deliveryLocation}</span>
            )}
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
              id="create-rfq-submit"
            >
              {loading ? 'Posting RFQ...' : 'Post RFQ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRFQPage;
