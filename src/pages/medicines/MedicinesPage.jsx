import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import api from '../../lib/api';
import {
  Pill, Plus, Search, Filter, Package, AlertTriangle,
  Calendar, Clock, MoreVertical, Edit, Archive
} from 'lucide-react';

export default function MedicinesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');

  const { data: medicinesData, isLoading } = useQuery({
    queryKey: ['medicines', statusFilter],
    queryFn: async () => {
      const response = await api.get('/medicines', {
        params: { status: statusFilter }
      });
      return response.data;
    },
  });

  const medicines = medicinesData?.medicines || [];

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'rgb(34 197 94)';
      case 'paused': return 'rgb(234 179 8)';
      case 'finished': return 'rgb(156 163 175)';
      case 'archived': return 'rgb(107 114 128)';
      default: return 'rgb(156 163 175)';
    }
  };

  const getStockStatus = (medicine) => {
    if (medicine.stock.quantity <= 0) return { label: 'Out of stock', color: 'rgb(239 68 68)' };
    if (medicine.stock.quantity <= medicine.stock.lowStockThreshold) {
      return { label: 'Low stock', color: 'rgb(234 179 8)' };
    }
    return { label: 'In stock', color: 'rgb(34 197 94)' };
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const daysUntilExpiry = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>Loading medicines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Medicines</h1>
          <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
            Manage your medications and schedules
          </p>
        </div>

        <Link
          to="/app/medicines/add"
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all"
          style={{
            backgroundColor: 'rgb(var(--color-primary))',
            color: 'rgb(var(--color-primary-foreground))',
          }}
        >
          <Plus className="w-5 h-5" />
          Add Medicine
        </Link>
      </div>

      {/* Filters */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{ color: 'rgb(var(--color-muted-foreground))' }}
          />
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'rgb(var(--color-background))',
              borderColor: 'rgb(var(--color-border))',
              color: 'rgb(var(--color-foreground))',
            }}
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
          style={{
            backgroundColor: 'rgb(var(--color-background))',
            borderColor: 'rgb(var(--color-border))',
            color: 'rgb(var(--color-foreground))',
          }}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="finished">Finished</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Medicines Grid */}
      {filteredMedicines.length === 0 ? (
        <div
          className="text-center py-12 rounded-xl border"
          style={{
            backgroundColor: 'rgb(var(--color-card))',
            borderColor: 'rgb(var(--color-border))',
          }}
        >
          <Pill className="w-16 h-16 mx-auto mb-4" style={{ color: 'rgb(var(--color-muted-foreground))' }} />
          <h3 className="text-lg font-semibold mb-2">No medicines found</h3>
          <p className="mb-6" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
            {searchTerm ? 'Try a different search term' : 'Get started by adding your first medicine'}
          </p>
          {!searchTerm && (
            <Link
              to="/app/medicines/add"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium"
              style={{
                backgroundColor: 'rgb(var(--color-primary))',
                color: 'rgb(var(--color-primary-foreground))',
              }}
            >
              <Plus className="w-5 h-5" />
              Add Your First Medicine
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedicines.map((medicine) => {
            const stockStatus = getStockStatus(medicine);
            const expiringSoon = isExpiringSoon(medicine.expiryDate);
            const expired = isExpired(medicine.expiryDate);

            return (
              <Link
                key={medicine._id}
                to={`/app/medicines/${medicine._id}`}
                className="p-6 rounded-xl border transition-all hover:shadow-lg"
                style={{
                  backgroundColor: 'rgb(var(--color-card))',
                  borderColor: 'rgb(var(--color-border))',
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgb(var(--color-primary) / 0.1)' }}
                  >
                    <Pill className="w-6 h-6" style={{ color: 'rgb(var(--color-primary))' }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${getStatusColor(medicine.status)}15`,
                        color: getStatusColor(medicine.status),
                      }}
                    >
                      {medicine.status}
                    </span>
                  </div>
                </div>

                {/* Medicine Info */}
                <h3 className="text-lg font-semibold mb-1">{medicine.name}</h3>
                {medicine.strength && (
                  <p className="text-sm mb-3" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                    {medicine.strength} {medicine.strengthUnit}
                    {medicine.form && ` • ${medicine.form}`}
                  </p>
                )}

                {/* Alerts */}
                <div className="space-y-2 mb-4">
                  {expired && (
                    <div
                      className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
                      style={{ backgroundColor: 'rgb(239 68 68 / 0.1)', color: 'rgb(239 68 68)' }}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Expired</span>
                    </div>
                  )}
                  {!expired && expiringSoon && (
                    <div
                      className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
                      style={{ backgroundColor: 'rgb(234 179 8 / 0.1)', color: 'rgb(234 179 8)' }}
                    >
                      <Clock className="w-4 h-4" />
                      <span>Expiring soon</span>
                    </div>
                  )}
                  {stockStatus.label !== 'In stock' && (
                    <div
                      className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
                      style={{ backgroundColor: `${stockStatus.color}15`, color: stockStatus.color }}
                    >
                      <Package className="w-4 h-4" />
                      <span>{stockStatus.label}</span>
                    </div>
                  )}
                </div>

                {/* Stock Info */}
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span style={{ color: 'rgb(var(--color-muted-foreground))' }}>Stock: </span>
                    <span className="font-medium">
                      {medicine.stock.quantity} {medicine.stock.unit}
                    </span>
                  </div>
                  {medicine.expiryDate && (
                    <div>
                      <span style={{ color: 'rgb(var(--color-muted-foreground))' }}>Exp: </span>
                      <span className="font-medium">
                        {new Date(medicine.expiryDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Schedule Info */}
                {medicine.schedule?.times && medicine.schedule.times.length > 0 && (
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgb(var(--color-border))' }}>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" style={{ color: 'rgb(var(--color-muted-foreground))' }} />
                      <span style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                        {medicine.schedule.times.length}x daily
                      </span>
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {filteredMedicines.length > 0 && (
        <div
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: 'rgb(var(--color-card))',
            borderColor: 'rgb(var(--color-border))',
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{filteredMedicines.length}</p>
              <p className="text-sm" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                Total Medicines
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'rgb(34 197 94)' }}>
                {filteredMedicines.filter(m => m.status === 'active').length}
              </p>
              <p className="text-sm" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                Active
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'rgb(234 179 8)' }}>
                {filteredMedicines.filter(m => getStockStatus(m).label !== 'In stock').length}
              </p>
              <p className="text-sm" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                Low Stock
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'rgb(239 68 68)' }}>
                {filteredMedicines.filter(m => isExpiringSoon(m.expiryDate) || isExpired(m.expiryDate)).length}
              </p>
              <p className="text-sm" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                Expiring/Expired
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
