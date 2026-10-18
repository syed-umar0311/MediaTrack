import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function SettingsPage() {
  const { mode, palette, changeMode, changePalette } = useTheme();

  const palettes = [
    { id: 'monochrome', name: 'Monochrome', description: 'Classic black and white' },
    { id: 'ocean', name: 'Ocean Blue', description: 'Cool blue tones' },
    { id: 'emerald', name: 'Emerald', description: 'Fresh green hues' },
    { id: 'lavender', name: 'Lavender', description: 'Soft purple shades' },
    { id: 'rose', name: 'Rose', description: 'Warm rose tints' },
    { id: 'amber', name: 'Amber', description: 'Warm amber glow' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
          Customize your MediTrack experience
        </p>
      </div>

      {/* Theme Mode */}
      <div
        className="p-6 rounded-xl border"
        style={{
          backgroundColor: 'rgb(var(--color-card))',
          borderColor: 'rgb(var(--color-border))',
        }}
      >
        <h2 className="text-lg font-semibold mb-4">Appearance Mode</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: 'light', name: 'Light', icon: Sun },
            { id: 'dark', name: 'Dark', icon: Moon },
            { id: 'system', name: 'System', icon: Monitor },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = mode === item.id;

            return (
              <button
                key={item.id}
                onClick={() => changeMode(item.id)}
                className="p-4 rounded-lg border transition-all hover:opacity-80"
                style={{
                  backgroundColor: isActive ? 'rgb(var(--color-primary) / 0.1)' : 'transparent',
                  borderColor: isActive ? 'rgb(var(--color-primary))' : 'rgb(var(--color-border))',
                  color: isActive ? 'rgb(var(--color-primary))' : 'rgb(var(--color-foreground))',
                }}
              >
                <Icon className="w-8 h-8 mx-auto mb-2" />
                <p className="font-medium">{item.name}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Palette */}
      <div
        className="p-6 rounded-xl border"
        style={{
          backgroundColor: 'rgb(var(--color-card))',
          borderColor: 'rgb(var(--color-border))',
        }}
      >
        <h2 className="text-lg font-semibold mb-4">Color Palette</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {palettes.map((item) => {
            const isActive = palette === item.id;

            return (
              <button
                key={item.id}
                onClick={() => changePalette(item.id)}
                className="p-4 rounded-lg border text-left transition-all hover:opacity-80"
                style={{
                  backgroundColor: isActive ? 'rgb(var(--color-primary) / 0.1)' : 'transparent',
                  borderColor: isActive ? 'rgb(var(--color-primary))' : 'rgb(var(--color-border))',
                }}
              >
                <p
                  className="font-medium mb-1"
                  style={{
                    color: isActive ? 'rgb(var(--color-primary))' : 'rgb(var(--color-foreground))',
                  }}
                >
                  {item.name}
                  {isActive && ' ✓'}
                </p>
                <p className="text-sm" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Other Settings Placeholder */}
      <div
        className="p-6 rounded-xl border"
        style={{
          backgroundColor: 'rgb(var(--color-card))',
          borderColor: 'rgb(var(--color-border))',
        }}
      >
        <h2 className="text-lg font-semibold mb-4">Additional Settings</h2>
        <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
          Profile, privacy, notification preferences, and other settings - Full functionality coming soon
        </p>
      </div>
    </div>
  );
}
