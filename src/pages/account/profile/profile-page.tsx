import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/auth/context/auth-context';
import { Camera, Lock, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { handleAvatarRemove, handleAvatarUpload } from '@/lib/api/profiles';
import { useProfile } from '@/hooks/use-training-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ProfilePage() {
  const { user, resetPassword } = useAuth();
  const { data: profile, isLoading, refetch: refetchProfile } = useProfile();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const userEmail = user?.email || '';

  useEffect(() => {
    if (profile) {
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setMessage(null);

    try {
      const newAvatarUrl = await handleAvatarUpload(file);
      setAvatarUrl(newAvatarUrl);

      // Invalidate profile query to update UI everywhere
      await refetchProfile();

      setMessage({ type: 'success', text: 'Profile picture updated.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to upload image.';
      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAvatar = async () => {
    if (!avatarUrl) return;

    setUploadLoading(true);
    try {
      await handleAvatarRemove();
      setAvatarUrl('');

      // Invalidate profile query
      await refetchProfile();

      setMessage({ type: 'success', text: 'Profile picture removed.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to remove image.';
      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setUploadLoading(false);
    }
  };
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 6 characters.',
      });
      return;
    }

    setPasswordLoading(true);
    setMessage(null);

    try {
      await resetPassword(newPassword, confirmPassword);
      setMessage({ type: 'success', text: 'Password updated successfully.' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage(null), 3000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to update password.',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="container-fixed py-6">
      <div className="mx-auto max-w-2xl space-y-6 pb-12">
        {/* Header */}
        <header>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight lowercase">
            athlete profile
          </h2>
          <p className="text-muted-foreground font-medium text-sm md:text-base lowercase">
            manage your account and security settings.
          </p>
        </header>

        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-2xl border text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2 ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800 text-green-600 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-600 dark:text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profile Identity Card */}
        <div className="p-6 md:p-8 bg-card rounded-2xl shadow-sm border">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="relative group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-muted shadow-xl"
                />
              ) : (
                <div className="w-32 h-32 bg-primary rounded-2xl flex items-center justify-center text-white text-5xl font-black shadow-xl shadow-primary/20">
                  {userEmail?.[0]?.toUpperCase() || 'A'}
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-2xl backdrop-blur-sm">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadLoading}
                  className="p-3 bg-white text-primary rounded-full shadow-lg active:scale-90 transition-transform disabled:opacity-50"
                >
                  <Camera className="w-6 h-6" />
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={uploadLoading}
              />
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] block mb-1">
                  authenticated athlete
                </span>
                <h3 className="text-xl md:text-2xl font-black tracking-tight lowercase">
                  {userEmail}
                </h3>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="sm"
                  disabled={uploadLoading}
                  className="text-[10px] font-black uppercase tracking-widest"
                >
                  {uploadLoading ? 'processing...' : 'change photo'}
                </Button>
                {avatarUrl && (
                  <Button
                    onClick={removeAvatar}
                    size="sm"
                    variant="outline"
                    disabled={uploadLoading}
                    className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-700 disabled:text-red-300"
                  >
                    remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Appearance Card */}
        <div className="p-6 md:p-8 bg-card rounded-2xl shadow-sm border">
          <h3 className="text-lg md:text-xl font-black tracking-tight mb-6 flex items-center gap-2 lowercase">
            {theme === 'dark' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
            appearance
          </h3>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose your preferred theme for the application.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setTheme('light')}
                variant={theme === 'light' ? 'default' : 'outline'}
                className="flex-1 gap-2"
              >
                <Sun className="w-4 h-4" />
                Light
              </Button>
              <Button
                onClick={() => setTheme('dark')}
                variant={theme === 'dark' ? 'default' : 'outline'}
                className="flex-1 gap-2"
              >
                <Moon className="w-4 h-4" />
                Dark
              </Button>
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="p-6 md:p-8 bg-card rounded-2xl shadow-sm border">
          <h3 className="text-lg md:text-xl font-black tracking-tight mb-6 flex items-center gap-2 lowercase">
            <Lock className="w-5 h-5" />
            security & password
          </h3>

          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">
                  new password
                </Label>
                <Input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="font-bold"
                />
              </div>
              <div>
                <Label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">
                  confirm password
                </Label>
                <Input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="font-bold"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={passwordLoading}
              className="w-full md:w-auto text-[11px] font-black uppercase tracking-[0.2em]"
            >
              {passwordLoading ? 'syncing...' : 'update athlete credentials'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
