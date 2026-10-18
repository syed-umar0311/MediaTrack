import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import {
  Pill, Plus, Calendar, AlertTriangle, Clock, CheckCircle,
  TrendingUp, Package, Users, ScanLine
} from 'lucide-react';

export default function Dashboard() {
  // Fetch dashboard summary
  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const response = await api.get('/reports/dashboard-summary');
      return response.data.summary;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const todayStats = summary?.today || {};
  const nextDose = summary?.nextDose;
  const lowStock = summary?.lowStock || {};
  const expiringSoon = summary?.expiringSoon || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
            Welcome back! Here's your medicine overview.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/app/medicines/add"
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
            style={{
              backgroundColor: 'rgb(var(--color-primary))',
              color: 'rgb(var(--color-primary-foreground))',
            }}
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Medicine</span>
          </Link>

          <Link
            to="/app/scan/prescription"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all hover:bg-[rgb(var(--color-secondary))]"
            style={{ borderColor: 'rgb(var(--color-border))' }}
          >
            <ScanLine className="w-5 h-5" />
            <span className="hidden sm:inline">Scan</span>
          </Link>
        </div>
      </div>

      {/* Today's Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Doses Today */}
        <div
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: 'rgb(var(--color-card))',
            borderColor: 'rgb(var(--color-border))',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: 'rgb(var(--color-primary) / 0.1)' }}
            >
              <Calendar className="w-6 h-6" style={{ color: 'rgb(var(--color-primary))' }} />
            </div>
          </div>
          <p className="text-3xl font-bold">{todayStats.total || 0}</p>
          <p className="text-sm" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
            Total doses today
          </p>
        </div>

        {/* Taken */}
        <div
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: 'rgb(var(--color-card))',
            borderColor: 'rgb(var(--color-border))',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: 'rgb(34 197 94 / 0.1)' }}
            >
              <CheckCircle className="w-6 h-6" style={{ color: 'rgb(34 197 94)' }} />
            </div>
          </div>
          <p className="text-3xl font-bold">{todayStats.taken || 0}</p>
          <p className="text-sm" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
            Doses taken
          </p>
        </div>

        {/* Pending */}
        <div
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: 'rgb(var(--color-card))',
            borderColor: 'rgb(var(--color-border))',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: 'rgb(234 179 8 / 0.1)' }}
            >
              <Clock className="w-6 h-6" style={{ color: 'rgb(234 179 8)' }} />
            </div>
          </div>
          <p className="text-3xl font-bold">{todayStats.pending || 0}</p>
          <p className="text-sm" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
            Pending doses
          </p>
        </div>

        {/* Missed */}
        <div
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: 'rgb(var(--color-card))',
            borderColor: 'rgb(var(--color-border))',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: 'rgb(239 68 68 / 0.1)' }}
            >
              <AlertTriangle className="w-6 h-6" style={{ color: 'rgb(239 68 68)' }} />
            </div>
          </div>
          <p className="text-3xl font-bold">{todayStats.missed || 0}</p>
          <p className="text-sm" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
            Missed doses
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Next Dose */}
        <div
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: 'rgb(var(--color-card))',
            borderColor: 'rgb(var(--color-border))',
          }}
        >
          <h2 className="text-lg font-semibold mb-4">Next Dose</h2>

          {nextDose ? (
            <div className="space-y-3">
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgb(var(--color-primary) / 0.1)' }}
                >
                  <Pill className="w-6 h-6" style={{ color: 'rgb(var(--color-primary))' }} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{nextDose.medicine?.name}</p>
                  {nextDose.medicine?.strength && (
                    <p className="text-sm" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                      {nextDose.medicine.strength}
                    </p>
                  )}
                  <p className="text-sm mt-2" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                    Scheduled: {new Date(nextDose.scheduledTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
              No upcoming doses scheduled
            </p>
          )}
        </div>

        {/* Today's Doses */}
        <div
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: 'rgb(var(--color-card))',
            borderColor: 'rgb(var(--color-border))',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Today's Schedule</h2>
            <Link
              to="/app/medicines"
              className="text-sm hover:underline"
              style={{ color: 'rgb(var(--color-primary))' }}
            >
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {todayStats.doses && todayStats.doses.length > 0 ? (
              todayStats.doses.slice(0, 5).map((dose) => (
                <div
                  key={dose._id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: 'rgb(var(--color-secondary))' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{dose.medicine?.name}</span>
                      <span className="text-xs" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                        {new Date(dose.scheduledTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  <div>
                    {dose.status === 'taken' && (
                      <CheckCircle className="w-5 h-5" style={{ color: 'rgb(34 197 94)' }} />
                    )}
                    {dose.status === 'pending' && (
                      <Clock className="w-5 h-5" style={{ color: 'rgb(234 179 8)' }} />
                    )}
                    {dose.status === 'missed' && (
                      <AlertTriangle className="w-5 h-5" style={{ color: 'rgb(239 68 68)' }} />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                No doses scheduled for today
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Alerts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: 'rgb(var(--color-card))',
            borderColor: 'rgb(var(--color-border))',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5" style={{ color: 'rgb(239 68 68)' }} />
            <h2 className="text-lg font-semibold">Low Stock Alert</h2>
            {lowStock.count > 0 && (
              <span
                className="ml-auto px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: 'rgb(239 68 68 / 0.1)',
                  color: 'rgb(239 68 68)',
                }}
              >
                {lowStock.count}
              </span>
            )}
          </div>

          {lowStock.medicines && lowStock.medicines.length > 0 ? (
            <div className="space-y-2">
              {lowStock.medicines.slice(0, 3).map((medicine) => (
                <Link
                  key={medicine._id}
                  to={`/app/medicines/${medicine._id}`}
                  className="block p-3 rounded-lg hover:bg-[rgb(var(--color-secondary))] transition-colors"
                >
                  <p className="font-medium text-sm">{medicine.name}</p>
                  <p className="text-xs" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                    {medicine.stock.quantity} {medicine.stock.unit} remaining
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
              All medicines have sufficient stock
            </p>
          )}
        </div>

        {/* Expiring Soon */}
        <div
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: 'rgb(var(--color-card))',
            borderColor: 'rgb(var(--color-border))',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5" style={{ color: 'rgb(234 179 8)' }} />
            <h2 className="text-lg font-semibold">Expiring Soon</h2>
            {expiringSoon.count > 0 && (
              <span
                className="ml-auto px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: 'rgb(234 179 8 / 0.1)',
                  color: 'rgb(234 179 8)',
                }}
              >
                {expiringSoon.count}
              </span>
            )}
          </div>

          {expiringSoon.medicines && expiringSoon.medicines.length > 0 ? (
            <div className="space-y-2">
              {expiringSoon.medicines.slice(0, 3).map((medicine) => (
                <Link
                  key={medicine._id}
                  to={`/app/medicines/${medicine._id}`}
                  className="block p-3 rounded-lg hover:bg-[rgb(var(--color-secondary))] transition-colors"
                >
                  <p className="font-medium text-sm">{medicine.name}</p>
                  <p className="text-xs" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                    Expires: {new Date(medicine.expiryDate).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
              No medicines expiring in the next 30 days
            </p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div
        className="p-6 rounded-xl border"
        style={{
          backgroundColor: 'rgb(var(--color-card))',
          borderColor: 'rgb(var(--color-border))',
        }}
      >
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/app/medicines/add"
            className="p-4 rounded-lg border hover:bg-[rgb(var(--color-secondary))] transition-colors text-center"
            style={{ borderColor: 'rgb(var(--color-border))' }}
          >
            <Plus className="w-8 h-8 mx-auto mb-2" style={{ color: 'rgb(var(--color-primary))' }} />
            <p className="font-medium">Add Medicine</p>
          </Link>

          <Link
            to="/app/scan/prescription"
            className="p-4 rounded-lg border hover:bg-[rgb(var(--color-secondary))] transition-colors text-center"
            style={{ borderColor: 'rgb(var(--color-border))' }}
          >
            <ScanLine className="w-8 h-8 mx-auto mb-2" style={{ color: 'rgb(var(--color-primary))' }} />
            <p className="font-medium">Scan Prescription</p>
          </Link>

          <Link
            to="/app/family"
            className="p-4 rounded-lg border hover:bg-[rgb(var(--color-secondary))] transition-colors text-center"
            style={{ borderColor: 'rgb(var(--color-border))' }}
          >
            <Users className="w-8 h-8 mx-auto mb-2" style={{ color: 'rgb(var(--color-primary))' }} />
            <p className="font-medium">Family Hub</p>
          </Link>

          <Link
            to="/app/reports"
            className="p-4 rounded-lg border hover:bg-[rgb(var(--color-secondary))] transition-colors text-center"
            style={{ borderColor: 'rgb(var(--color-border))' }}
          >
            <TrendingUp className="w-8 h-8 mx-auto mb-2" style={{ color: 'rgb(var(--color-primary))' }} />
            <p className="font-medium">View Reports</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
