import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Pill, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: 'rgb(var(--color-background))' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Pill className="w-10 h-10" style={{ color: 'rgb(var(--color-primary))' }} />
          <span className="text-2xl font-bold">MediTrack</span>
        </Link>

        {/* Card */}
        <div
          className="p-8 rounded-xl border shadow-lg"
          style={{
            backgroundColor: 'rgb(var(--color-card))',
            borderColor: 'rgb(var(--color-border))',
          }}
        >
          <h1 className="text-2xl font-bold mb-2 text-center">Welcome Back</h1>
          <p
            className="text-center mb-8"
            style={{ color: 'rgb(var(--color-muted-foreground))' }}
          >
            Sign in to your MediTrack account
          </p>

          {/* Error Message */}
          {error && (
            <div
              className="mb-6 p-4 rounded-lg flex items-start gap-3"
              style={{ backgroundColor: 'rgb(239 68 68 / 0.1)', color: 'rgb(220 38 38)' }}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'rgb(var(--color-background))',
                  borderColor: 'rgb(var(--color-border))',
                  color: 'rgb(var(--color-foreground))',
                }}
                placeholder="your@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 pr-12"
                  style={{
                    backgroundColor: 'rgb(var(--color-background))',
                    borderColor: 'rgb(var(--color-border))',
                    color: 'rgb(var(--color-foreground))',
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:opacity-80"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" style={{ color: 'rgb(var(--color-muted-foreground))' }} />
                  ) : (
                    <Eye className="w-5 h-5" style={{ color: 'rgb(var(--color-muted-foreground))' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'rgb(var(--color-primary))',
                color: 'rgb(var(--color-primary-foreground))',
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium hover:underline"
                style={{ color: 'rgb(var(--color-primary))' }}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="hover:underline"
            style={{ color: 'rgb(var(--color-muted-foreground))' }}
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
