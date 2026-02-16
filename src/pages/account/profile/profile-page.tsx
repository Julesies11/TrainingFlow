import { useState, useEffect } from 'react';
import { User, Dumbbell, Heart, Weight, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProfile, useUpdateProfile } from '@/hooks/use-training-data';
import { useSupabaseUserId } from '@/hooks/use-supabase-user';
import { supabase } from '@/lib/supabase';

export function ProfilePage() {
  const userId = useSupabaseUserId();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [userEmail, setUserEmail] = useState<string>('');
  const [ftp, setFtp] = useState<number>(200);
  const [thresholdHr, setThresholdHr] = useState<number>(170);
  const [weight, setWeight] = useState<number>(70);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email || '');
    });
  }, []);

  useEffect(() => {
    if (profile) {
      setFtp(profile.ftp);
      setThresholdHr(profile.threshold_hr);
      setWeight(profile.weight);
      setHasChanges(false);
    }
  }, [profile]);

  const handleSave = () => {
    if (!userId) return;
    updateProfile.mutate(
      {
        ftp,
        threshold_hr: thresholdHr,
        weight,
      },
      {
        onSuccess: () => {
          setHasChanges(false);
        },
      }
    );
  };

  const handleChange = (field: 'ftp' | 'hr' | 'weight', value: number) => {
    setHasChanges(true);
    if (field === 'ftp') setFtp(value);
    if (field === 'hr') setThresholdHr(value);
    if (field === 'weight') setWeight(value);
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4.5rem)] items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="container-fixed py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black lowercase tracking-tight">
            profile
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your account and training settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Account Info */}
          <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
            <div className="border-b bg-muted/30 px-6 py-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <h2 className="text-lg font-black lowercase tracking-tight">
                  account information
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
                    email
                  </Label>
                  <Input
                    type="email"
                    value={userEmail}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-muted-foreground mt-1 text-xs">
                    Email cannot be changed
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
                    user id
                  </Label>
                  <Input
                    type="text"
                    value={userId || ''}
                    disabled
                    className="bg-muted cursor-not-allowed font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Training Settings */}
          <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
            <div className="border-b bg-muted/30 px-6 py-4">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                <h2 className="text-lg font-black lowercase tracking-tight">
                  training metrics
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-3">
                {/* FTP */}
                <div className="bg-muted/50 space-y-3 rounded-xl border p-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                      <Dumbbell className="h-5 w-5" />
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                        FTP (watts)
                      </Label>
                      <p className="text-muted-foreground text-[10px]">
                        Functional Threshold Power
                      </p>
                    </div>
                  </div>
                  <Input
                    type="number"
                    value={ftp}
                    onChange={(e) => handleChange('ftp', Number(e.target.value))}
                    min={0}
                    className="text-center text-2xl font-black"
                  />
                </div>

                {/* Threshold HR */}
                <div className="bg-muted/50 space-y-3 rounded-xl border p-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-red-500/10 flex h-10 w-10 items-center justify-center rounded-lg text-red-500">
                      <Heart className="h-5 w-5" />
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                        Threshold HR
                      </Label>
                      <p className="text-muted-foreground text-[10px]">
                        Lactate Threshold Heart Rate
                      </p>
                    </div>
                  </div>
                  <Input
                    type="number"
                    value={thresholdHr}
                    onChange={(e) => handleChange('hr', Number(e.target.value))}
                    min={0}
                    max={220}
                    className="text-center text-2xl font-black"
                  />
                </div>

                {/* Weight */}
                <div className="bg-muted/50 space-y-3 rounded-xl border p-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-500/10 flex h-10 w-10 items-center justify-center rounded-lg text-blue-500">
                      <Weight className="h-5 w-5" />
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                        Weight (kg)
                      </Label>
                      <p className="text-muted-foreground text-[10px]">
                        Body weight
                      </p>
                    </div>
                  </div>
                  <Input
                    type="number"
                    value={weight}
                    onChange={(e) => handleChange('weight', Number(e.target.value))}
                    min={0}
                    step={0.1}
                    className="text-center text-2xl font-black"
                  />
                </div>
              </div>

              {/* Save button */}
              {hasChanges && (
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleSave}
                    disabled={updateProfile.isPending}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Training Zones Info */}
          <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
            <div className="border-b bg-muted/30 px-6 py-4">
              <h2 className="text-lg font-black lowercase tracking-tight">
                calculated training zones
              </h2>
            </div>
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Power Zones */}
                <div>
                  <h3 className="text-muted-foreground mb-3 text-xs font-black uppercase tracking-widest">
                    Power Zones (based on FTP: {ftp}W)
                  </h3>
                  <div className="space-y-2">
                    {[
                      { zone: 'Z1 Active Recovery', pct: '< 55%', watts: `< ${Math.round(ftp * 0.55)}W` },
                      { zone: 'Z2 Endurance', pct: '56-75%', watts: `${Math.round(ftp * 0.56)}-${Math.round(ftp * 0.75)}W` },
                      { zone: 'Z3 Tempo', pct: '76-90%', watts: `${Math.round(ftp * 0.76)}-${Math.round(ftp * 0.90)}W` },
                      { zone: 'Z4 Threshold', pct: '91-105%', watts: `${Math.round(ftp * 0.91)}-${Math.round(ftp * 1.05)}W` },
                      { zone: 'Z5 VO2 Max', pct: '106-120%', watts: `${Math.round(ftp * 1.06)}-${Math.round(ftp * 1.20)}W` },
                      { zone: 'Z6 Anaerobic', pct: '> 120%', watts: `> ${Math.round(ftp * 1.20)}W` },
                    ].map((z, i) => (
                      <div key={i} className="bg-muted/50 flex items-center justify-between rounded-lg px-3 py-2">
                        <span className="text-sm font-semibold">{z.zone}</span>
                        <div className="text-muted-foreground flex gap-3 text-xs">
                          <span>{z.pct}</span>
                          <span className="font-mono">{z.watts}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* HR Zones */}
                <div>
                  <h3 className="text-muted-foreground mb-3 text-xs font-black uppercase tracking-widest">
                    Heart Rate Zones (based on LTHR: {thresholdHr} bpm)
                  </h3>
                  <div className="space-y-2">
                    {[
                      { zone: 'Z1 Active Recovery', pct: '< 81%', hr: `< ${Math.round(thresholdHr * 0.81)} bpm` },
                      { zone: 'Z2 Endurance', pct: '81-89%', hr: `${Math.round(thresholdHr * 0.81)}-${Math.round(thresholdHr * 0.89)} bpm` },
                      { zone: 'Z3 Tempo', pct: '90-93%', hr: `${Math.round(thresholdHr * 0.90)}-${Math.round(thresholdHr * 0.93)} bpm` },
                      { zone: 'Z4 Threshold', pct: '94-100%', hr: `${Math.round(thresholdHr * 0.94)}-${thresholdHr} bpm` },
                      { zone: 'Z5 VO2 Max', pct: '> 100%', hr: `> ${thresholdHr} bpm` },
                    ].map((z, i) => (
                      <div key={i} className="bg-muted/50 flex items-center justify-between rounded-lg px-3 py-2">
                        <span className="text-sm font-semibold">{z.zone}</span>
                        <div className="text-muted-foreground flex gap-3 text-xs">
                          <span>{z.pct}</span>
                          <span className="font-mono">{z.hr}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
