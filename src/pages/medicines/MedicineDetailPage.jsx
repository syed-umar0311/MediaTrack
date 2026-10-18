import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../../lib/api';
import {
  ArrowLeft, Pill, Edit, Archive, Package, Calendar, Clock,
  AlertTriangle, Plus, CheckCircle, XCircle, Info
} from 'lucide-react';

export default function MedicineDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockChange, setStockChange] = useState({ quantity: 0, reason: '' });

  // Fetch medicine details
  const { data: medicineData, isLoading } = useQuery({
    queryKey: ['medicine', id],
    queryFn: async () => {
      const response = await api.get(`/medicines/${id}`);
      return response.data.medicine;
    },
  });

  // Fetch dose history
  const { data: dosesData } = useQuery({
    queryKey: ['doses', id],
    queryFn: async () => {
      const response = await api.get('/doses', {
        params: { medicineId: id, limit: 20 }
      });
      return response.data.doses;
    },
    enabled: activeTab === 'history',
  });

  // Fetch stock history
  const { data: stockHistoryData } = useQuery({
    queryKey: ['stock-history', id],
    queryFn: async () => {
      const response = await api.get(`/stock/medicines/${id}/history`);
      return response.data.transactions;
    },
    enabled: activeTab === 'stock',
  });

  // Add stock mutation
  const addStockMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post(`/stock/medicines/${id}/transactions`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['medicine', id]);
      queryClient.invalidateQueries(['stock-history', id]);
      setShowStockModal(false);
      setStockChange({ quantity: 0, reason: '' });
    },
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/medicines/${id}/archive`);
      return response.data;
    },
    onSuccess: () => {
      navigate('/app/medicines');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>Loading medicine details...</p>
        </div>
      </div>
    );
  }

  const medicine = medicineData;
  const doses = dosesData || [];
  const stockHistory = stockHistoryData || [];

  const stockStatus = medicine.stock.quantity <= 0
    ? { label: 'Out of stock', color: 'rgb(239 68 68)' }
    : medicine.stock.quantity <= medicine.stock.lowStockThreshold
    ? { label: 'Low stock', color: 'rgb(234 179 8)' }
    : { label: 'In stock', color: 'rgb(34 197 94)' };

  const isExpired = medicine.expiryDate && new Date(medicine.expiryDate) < new Date();
  const isExpiringSoon = medicine.expiryDate &&
    Math.ceil((new Date(medicine.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) <= 30 &&
    !isExpired;

  const handleAddStock = (e) => {
    e.preventDefault();
    addStockMutation.mutate({
      type: stockChange.quantity > 0 ? 'refill' : 'adjustment',
      quantityChange: parseInt(stockChange.quantity),
      reason: stockChange.reason,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            to="/app/medicines"
            className="p-2 rounded-lg hover:bg-[rgb(var(--color-secondary))] transition-colors mt-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{medicine.name}</h1>
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: medicine.status === 'active' ? 'rgb(34 197 94 / 0.1)' : 'rgb(156 163 175 / 0.1)',
                  color: medicine.status === 'active' ? 'rgb(34 197 94)' : 'rgb(107 114 128)',
                }}
              >
                {medicine.status}
              </span>
            </div>
            {medicine.strength && (
              <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                {medicine.strength} {medicine.strengthUnit} • {medicine.form}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/app/medicines/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-[rgb(var(--color-secondary))] transition-colors"
            style={{ borderColor: 'rgb(var(--color-border))' }}
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            onClick={() => archiveMutation.mutate()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-[rgb(var(--color-secondary))] transition-colors"
            style={{ borderColor: 'rgb(var(--color-border))' }}
          >
            <Archive className="w-4 h-4" />
            <span className="hidden sm:inline">Archive</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {(isExpired || isExpiringSoon || stockStatus.label !== 'In stock') && (
        <div className="space-y-3">
          {isExpired && (
            <div
              className="p-4 rounded-lg flex items-start gap-3"
              style={{ backgroundColor: 'rgb(239 68 68 / 0.1)', color: 'rgb(220 38 38)' }}
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Expired Medicine</p>
                <p className="text-sm">This medicine expired on {new Date(medicine.expiryDate).toLocaleDateString()}. Consult a pharmacist about safe disposal.</p>
              </div>
            </div>
          )}
          {!isExpired && isExpiringSoon && (
            <div
              className="p-4 rounded-lg flex items-start gap-3"
              style={{ backgroundColor: 'rgb(234 179 8 / 0.1)', color: 'rgb(161 98 7)' }}
            >
              <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Expiring Soon</p>
                <p className="text-sm">Expires on {new Date(medicine.expiryDate).toLocaleDateString()}</p>
              </div>
            </div>
          )}
          {stockStatus.label !== 'In stock' && (
            <div
              className="p-4 rounded-lg flex items-start gap-3"
              style={{ backgroundColor: `${stockStatus.color}15`, color: stockStatus.color }}
            >
              <Package className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{stockStatus.label === 'Out of stock' ? 'Out of Stock' : 'Low Stock Alert'}</p>
                <p className="text-sm">
                  {medicine.stock.quantity} {medicine.stock.unit} remaining. Consider refilling soon.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b" style={{ borderColor: 'rgb(var(--color-border))' }}>
        <div className="flex gap-6">
          {['overview', 'schedule', 'stock', 'history', 'info'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="pb-3 px-1 font-medium transition-colors capitalize"
              style={{
                color: activeTab === tab ? 'rgb(var(--color-primary))' : 'rgb(var(--color-muted-foreground))',
                borderBottom: activeTab === tab ? '2px solid rgb(var(--color-primary))' : '2px solid transparent',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div
              className="p-6 rounded-xl border space-y-4"
              style={{
                backgroundColor: 'rgb(var(--color-card))',
                borderColor: 'rgb(var(--color-border))',
              }}
            >
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="space-y-3">
                {medicine.instructions && (
                  <div>
                    <p className="text-sm font-medium mb-1">Instructions</p>
                    <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                      {medicine.instructions}
                    </p>
                  </div>
                )}
                {medicine.manufacturer && (
                  <div>
                    <p className="text-sm font-medium mb-1">Manufacturer</p>
                    <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                      {medicine.manufacturer}
                    </p>
                  </div>
                )}
                {medicine.batchNumber && (
                  <div>
                    <p className="text-sm font-medium mb-1">Batch Number</p>
                    <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                      {medicine.batchNumber}
                    </p>
                  </div>
                )}
                {medicine.notes && (
                  <div>
                    <p className="text-sm font-medium mb-1">Notes</p>
                    <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                      {medicine.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Stock Info */}
            <div
              className="p-6 rounded-xl border space-y-4"
              style={{
                backgroundColor: 'rgb(var(--color-card))',
                borderColor: 'rgb(var(--color-border))',
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Stock Status</h3>
                <button
                  onClick={() => setShowStockModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: 'rgb(var(--color-primary))',
                    color: 'rgb(var(--color-primary-foreground))',
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add Stock
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm mb-1" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                    Current Stock
                  </p>
                  <p className="text-3xl font-bold">
                    {medicine.stock.quantity} <span className="text-lg">{medicine.stock.unit}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t" style={{ borderColor: 'rgb(var(--color-border))' }}>
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                      Per Dose
                    </p>
                    <p className="font-medium">{medicine.stock.doseQuantity} {medicine.stock.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                      Low Stock Alert
                    </p>
                    <p className="font-medium">{medicine.stock.lowStockThreshold} {medicine.stock.unit}</p>
                  </div>
                </div>

                {medicine.expiryDate && (
                  <div className="pt-3 border-t" style={{ borderColor: 'rgb(var(--color-border))' }}>
                    <p className="text-sm mb-1" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                      Expiry Date
                    </p>
                    <p className="font-medium">{new Date(medicine.expiryDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div
            className="p-6 rounded-xl border space-y-4"
            style={{
              backgroundColor: 'rgb(var(--color-card))',
              borderColor: 'rgb(var(--color-border))',
            }}
          >
            <h3 className="text-lg font-semibold">Schedule Information</h3>

            {medicine.schedule && medicine.schedule.times && medicine.schedule.times.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm mb-2" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                    Type: {medicine.schedule.type || 'Daily'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-3">Dose Times</p>
                  <div className="space-y-2">
                    {medicine.schedule.times.map((time, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg"
                        style={{ backgroundColor: 'rgb(var(--color-secondary))' }}
                      >
                        <Clock className="w-5 h-5" style={{ color: 'rgb(var(--color-primary))' }} />
                        <span className="font-medium">{time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: 'rgb(var(--color-border))' }}>
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                      Start Date
                    </p>
                    <p className="font-medium">
                      {medicine.startDate
                        ? new Date(medicine.startDate).toLocaleDateString()
                        : 'Not set'}
                    </p>
                  </div>
                  {medicine.endDate && (
                    <div>
                      <p className="text-sm mb-1" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                        End Date
                      </p>
                      <p className="font-medium">{new Date(medicine.endDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                No schedule configured. This medicine is taken as needed.
              </p>
            )}
          </div>
        )}

        {/* Stock History Tab */}
        {activeTab === 'stock' && (
          <div
            className="p-6 rounded-xl border space-y-4"
            style={{
              backgroundColor: 'rgb(var(--color-card))',
              borderColor: 'rgb(var(--color-border))',
            }}
          >
            <h3 className="text-lg font-semibold">Stock History</h3>

            {stockHistory.length > 0 ? (
              <div className="space-y-2">
                {stockHistory.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between p-4 rounded-lg"
                    style={{ backgroundColor: 'rgb(var(--color-secondary))' }}
                  >
                    <div>
                      <p className="font-medium capitalize">{transaction.type.replace('-', ' ')}</p>
                      {transaction.reason && (
                        <p className="text-sm" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                          {transaction.reason}
                        </p>
                      )}
                      <p className="text-xs mt-1" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                        {new Date(transaction.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-lg font-bold"
                        style={{ color: transaction.quantityChange > 0 ? 'rgb(34 197 94)' : 'rgb(239 68 68)' }}
                      >
                        {transaction.quantityChange > 0 ? '+' : ''}{transaction.quantityChange}
                      </p>
                      <p className="text-sm" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                        Balance: {transaction.quantityAfter}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                No stock transactions yet
              </p>
            )}
          </div>
        )}

        {/* Dose History Tab */}
        {activeTab === 'history' && (
          <div
            className="p-6 rounded-xl border space-y-4"
            style={{
              backgroundColor: 'rgb(var(--color-card))',
              borderColor: 'rgb(var(--color-border))',
            }}
          >
            <h3 className="text-lg font-semibold">Dose History</h3>

            {doses.length > 0 ? (
              <div className="space-y-2">
                {doses.map((dose) => (
                  <div
                    key={dose._id}
                    className="flex items-center justify-between p-4 rounded-lg"
                    style={{ backgroundColor: 'rgb(var(--color-secondary))' }}
                  >
                    <div>
                      <p className="font-medium">
                        {new Date(dose.scheduledTime).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {dose.actualTime && (
                        <p className="text-sm" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                          Taken at {new Date(dose.actualTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {dose.status === 'taken' && (
                        <>
                          <CheckCircle className="w-5 h-5" style={{ color: 'rgb(34 197 94)' }} />
                          <span className="font-medium" style={{ color: 'rgb(34 197 94)' }}>Taken</span>
                        </>
                      )}
                      {dose.status === 'skipped' && (
                        <>
                          <XCircle className="w-5 h-5" style={{ color: 'rgb(156 163 175)' }} />
                          <span className="font-medium" style={{ color: 'rgb(156 163 175)' }}>Skipped</span>
                        </>
                      )}
                      {dose.status === 'missed' && (
                        <>
                          <AlertTriangle className="w-5 h-5" style={{ color: 'rgb(239 68 68)' }} />
                          <span className="font-medium" style={{ color: 'rgb(239 68 68)' }}>Missed</span>
                        </>
                      )}
                      {dose.status === 'pending' && (
                        <>
                          <Clock className="w-5 h-5" style={{ color: 'rgb(234 179 8)' }} />
                          <span className="font-medium" style={{ color: 'rgb(234 179 8)' }}>Pending</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                No dose history available yet
              </p>
            )}
          </div>
        )}

        {/* Medicine Info Tab */}
        {activeTab === 'info' && (
          <div
            className="p-6 rounded-xl border space-y-4"
            style={{
              backgroundColor: 'rgb(var(--color-card))',
              borderColor: 'rgb(var(--color-border))',
            }}
          >
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 mt-0.5" style={{ color: 'rgb(var(--color-primary))' }} />
              <div>
                <h3 className="text-lg font-semibold mb-2">Medicine Information</h3>
                <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                  Detailed medicine information from trusted sources will be displayed here when the feature is fully configured.
                  This includes active ingredients, common side effects, and allergy warnings.
                </p>
                <p className="mt-3 text-sm" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                  <strong>Note:</strong> Always consult healthcare professionals for medical advice. This information is for reference only.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stock Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="w-full max-w-md p-6 rounded-xl space-y-4"
            style={{
              backgroundColor: 'rgb(var(--color-card))',
            }}
          >
            <h3 className="text-lg font-semibold">Add/Remove Stock</h3>

            <form onSubmit={handleAddStock} className="space-y-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium mb-2">
                  Quantity Change
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={stockChange.quantity}
                  onChange={(e) => setStockChange({ ...stockChange, quantity: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'rgb(var(--color-background))',
                    borderColor: 'rgb(var(--color-border))',
                    color: 'rgb(var(--color-foreground))',
                  }}
                  placeholder="Enter positive to add, negative to remove"
                  required
                />
                <p className="text-sm mt-1" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                  Current: {medicine.stock.quantity} {medicine.stock.unit}
                </p>
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium mb-2">
                  Reason
                </label>
                <input
                  type="text"
                  id="reason"
                  value={stockChange.reason}
                  onChange={(e) => setStockChange({ ...stockChange, reason: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'rgb(var(--color-background))',
                    borderColor: 'rgb(var(--color-border))',
                    color: 'rgb(var(--color-foreground))',
                  }}
                  placeholder="e.g., Purchased refill, Discarded expired"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={addStockMutation.isPending}
                  className="flex-1 py-3 rounded-lg font-medium transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: 'rgb(var(--color-primary))',
                    color: 'rgb(var(--color-primary-foreground))',
                  }}
                >
                  {addStockMutation.isPending ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="px-6 py-3 rounded-lg border font-medium hover:bg-[rgb(var(--color-secondary))] transition-colors"
                  style={{ borderColor: 'rgb(var(--color-border))' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
