import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../../lib/api';
import {
  ArrowLeft, Plus, Trash2, AlertCircle, CheckCircle
} from 'lucide-react';

export default function AddMedicinePage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    strength: '',
    strengthUnit: 'mg',
    form: 'tablet',
    instructions: '',
    schedule: {
      type: 'daily',
      times: ['08:00'],
      frequency: 1,
    },
    stock: {
      quantity: 0,
      unit: 'tablets',
      lowStockThreshold: 5,
      doseQuantity: 1,
    },
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    expiryDate: '',
    manufacturer: '',
    batchNumber: '',
    notes: '',
  });

  const createMedicineMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/medicines', data);
      return response.data;
    },
    onSuccess: () => {
      navigate('/app/medicines');
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Failed to create medicine');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    setError('');
  };

  const handleTimeChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        times: prev.schedule.times.map((time, i) => i === index ? value : time),
      },
    }));
  };

  const addTime = () => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        times: [...prev.schedule.times, '12:00'],
        frequency: prev.schedule.times.length + 1,
      },
    }));
  };

  const removeTime = (index) => {
    if (formData.schedule.times.length > 1) {
      setFormData(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          times: prev.schedule.times.filter((_, i) => i !== index),
          frequency: prev.schedule.times.length - 1,
        },
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Medicine name is required');
      return;
    }

    createMedicineMutation.mutate(formData);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/app/medicines"
          className="p-2 rounded-lg hover:bg-[rgb(var(--color-secondary))] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add Medicine</h1>
          <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
            Enter medicine details manually
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="p-4 rounded-lg flex items-start gap-3"
          style={{ backgroundColor: 'rgb(239 68 68 / 0.1)', color: 'rgb(220 38 38)' }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div
          className="p-6 rounded-xl border space-y-4"
          style={{
            backgroundColor: 'rgb(var(--color-card))',
            borderColor: 'rgb(var(--color-border))',
          }}
        >
          <h2 className="text-lg font-semibold">Basic Information</h2>

          {/* Medicine Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Medicine Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                borderColor: 'rgb(var(--color-border))',
                color: 'rgb(var(--color-foreground))',
              }}
              placeholder="e.g., Aspirin"
            />
          </div>

          {/* Strength & Form */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="strength" className="block text-sm font-medium mb-2">
                Strength
              </label>
              <input
                type="text"
                id="strength"
                name="strength"
                value={formData.strength}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'rgb(var(--color-background))',
                  borderColor: 'rgb(var(--color-border))',
                  color: 'rgb(var(--color-foreground))',
                }}
                placeholder="e.g., 500"
              />
            </div>

            <div>
              <label htmlFor="strengthUnit" className="block text-sm font-medium mb-2">
                Unit
              </label>
              <select
                id="strengthUnit"
                name="strengthUnit"
                value={formData.strengthUnit}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'rgb(var(--color-background))',
                  borderColor: 'rgb(var(--color-border))',
                  color: 'rgb(var(--color-foreground))',
                }}
              >
                <option value="mg">mg</option>
                <option value="g">g</option>
                <option value="mcg">mcg</option>
                <option value="ml">ml</option>
                <option value="IU">IU</option>
              </select>
            </div>

            <div>
              <label htmlFor="form" className="block text-sm font-medium mb-2">
                Form
              </label>
              <select
                id="form"
                name="form"
                value={formData.form}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'rgb(var(--color-background))',
                  borderColor: 'rgb(var(--color-border))',
                  color: 'rgb(var(--color-foreground))',
                }}
              >
                <option value="tablet">Tablet</option>
                <option value="capsule">Capsule</option>
                <option value="syrup">Syrup</option>
                <option value="injection">Injection</option>
                <option value="drops">Drops</option>
                <option value="cream">Cream</option>
                <option value="inhaler">Inhaler</option>
                <option value="patch">Patch</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label htmlFor="instructions" className="block text-sm font-medium mb-2">
              Instructions
            </label>
            <textarea
              id="instructions"
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                borderColor: 'rgb(var(--color-border))',
                color: 'rgb(var(--color-foreground))',
              }}
              placeholder="e.g., Take with food"
            />
          </div>
        </div>

        {/* Schedule */}
        <div
          className="p-6 rounded-xl border space-y-4"
          style={{
            backgroundColor: 'rgb(var(--color-card))',
            borderColor: 'rgb(var(--color-border))',
          }}
        >
          <h2 className="text-lg font-semibold">Schedule</h2>

          {/* Schedule Type */}
          <div>
            <label htmlFor="schedule.type" className="block text-sm font-medium mb-2">
              Schedule Type
            </label>
            <select
              id="schedule.type"
              name="schedule.type"
              value={formData.schedule.type}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                borderColor: 'rgb(var(--color-border))',
                color: 'rgb(var(--color-foreground))',
              }}
            >
              <option value="daily">Daily</option>
              <option value="as-needed">As Needed</option>
              <option value="specific-days">Specific Days</option>
            </select>
          </div>

          {/* Times */}
          {formData.schedule.type === 'daily' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Dose Times
              </label>
              <div className="space-y-2">
                {formData.schedule.times.map((time, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => handleTimeChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'rgb(var(--color-background))',
                        borderColor: 'rgb(var(--color-border))',
                        color: 'rgb(var(--color-foreground))',
                      }}
                    />
                    {formData.schedule.times.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTime(index)}
                        className="p-3 rounded-lg border hover:bg-[rgb(var(--color-secondary))] transition-colors"
                        style={{ borderColor: 'rgb(var(--color-border))' }}
                      >
                        <Trash2 className="w-5 h-5" style={{ color: 'rgb(239 68 68)' }} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTime}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-[rgb(var(--color-secondary))] transition-colors"
                  style={{ borderColor: 'rgb(var(--color-border))' }}
                >
                  <Plus className="w-4 h-4" />
                  Add Another Time
                </button>
              </div>
            </div>
          )}

          {/* Duration */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium mb-2">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'rgb(var(--color-background))',
                  borderColor: 'rgb(var(--color-border))',
                  color: 'rgb(var(--color-foreground))',
                }}
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium mb-2">
                End Date (Optional)
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'rgb(var(--color-background))',
                  borderColor: 'rgb(var(--color-border))',
                  color: 'rgb(var(--color-foreground))',
                }}
              />
            </div>
          </div>
        </div>

        {/* Stock Management */}
        <div
          className="p-6 rounded-xl border space-y-4"
          style={{
            backgroundColor: 'rgb(var(--color-card))',
            borderColor: 'rgb(var(--color-border))',
          }}
        >
          <h2 className="text-lg font-semibold">Stock Management</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="stock.quantity" className="block text-sm font-medium mb-2">
                Current Stock
              </label>
              <input
                type="number"
                id="stock.quantity"
                name="stock.quantity"
                value={formData.stock.quantity}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'rgb(var(--color-background))',
                  borderColor: 'rgb(var(--color-border))',
                  color: 'rgb(var(--color-foreground))',
                }}
              />
            </div>

            <div>
              <label htmlFor="stock.unit" className="block text-sm font-medium mb-2">
                Stock Unit
              </label>
              <input
                type="text"
                id="stock.unit"
                name="stock.unit"
                value={formData.stock.unit}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'rgb(var(--color-background))',
                  borderColor: 'rgb(var(--color-border))',
                  color: 'rgb(var(--color-foreground))',
                }}
                placeholder="e.g., tablets, ml"
              />
            </div>

            <div>
              <label htmlFor="stock.lowStockThreshold" className="block text-sm font-medium mb-2">
                Low Stock Alert Threshold
              </label>
              <input
                type="number"
                id="stock.lowStockThreshold"
                name="stock.lowStockThreshold"
                value={formData.stock.lowStockThreshold}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'rgb(var(--color-background))',
                  borderColor: 'rgb(var(--color-border))',
                  color: 'rgb(var(--color-foreground))',
                }}
              />
            </div>

            <div>
              <label htmlFor="stock.doseQuantity" className="block text-sm font-medium mb-2">
                Quantity Per Dose
              </label>
              <input
                type="number"
                id="stock.doseQuantity"
                name="stock.doseQuantity"
                value={formData.stock.doseQuantity}
                onChange={handleChange}
                min="1"
                step="0.5"
                className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'rgb(var(--color-background))',
                  borderColor: 'rgb(var(--color-border))',
                  color: 'rgb(var(--color-foreground))',
                }}
              />
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div
          className="p-6 rounded-xl border space-y-4"
          style={{
            backgroundColor: 'rgb(var(--color-card))',
            borderColor: 'rgb(var(--color-border))',
          }}
        >
          <h2 className="text-lg font-semibold">Additional Details</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'rgb(var(--color-background))',
                  borderColor: 'rgb(var(--color-border))',
                  color: 'rgb(var(--color-foreground))',
                }}
              />
            </div>

            <div>
              <label htmlFor="manufacturer" className="block text-sm font-medium mb-2">
                Manufacturer
              </label>
              <input
                type="text"
                id="manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'rgb(var(--color-background))',
                  borderColor: 'rgb(var(--color-border))',
                  color: 'rgb(var(--color-foreground))',
                }}
                placeholder="Optional"
              />
            </div>

            <div>
              <label htmlFor="batchNumber" className="block text-sm font-medium mb-2">
                Batch Number
              </label>
              <input
                type="text"
                id="batchNumber"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'rgb(var(--color-background))',
                  borderColor: 'rgb(var(--color-border))',
                  color: 'rgb(var(--color-foreground))',
                }}
                placeholder="Optional"
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                borderColor: 'rgb(var(--color-border))',
                color: 'rgb(var(--color-foreground))',
              }}
              placeholder="Any additional notes..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={createMedicineMutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'rgb(var(--color-primary))',
              color: 'rgb(var(--color-primary-foreground))',
            }}
          >
            {createMedicineMutation.isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Create Medicine
              </>
            )}
          </button>

          <Link
            to="/app/medicines"
            className="px-6 py-3 rounded-lg border font-medium hover:bg-[rgb(var(--color-secondary))] transition-colors"
            style={{ borderColor: 'rgb(var(--color-border))' }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
