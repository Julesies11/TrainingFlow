import { useState, useMemo } from 'react';
import { Ruler, Timer, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useSportTypes,
  useUserSportSettings,
  useUpsertUserSportSettings,
} from '@/hooks/use-training-data';
import { getContrastColor } from '@/services/training/calendar.utils';
import {
  getEffortColor,
  getEffortLabel,
  buildUserSettingsMap,
} from '@/services/training/effort-colors';

export function SportTypesPage() {
  const { data: sportTypes = [], isLoading: loadingSports } = useSportTypes();
  const { data: userSettings = [], isLoading: loadingSettings } = useUserSportSettings();
  const upsertSettings = useUpsertUserSportSettings();

  const settingsMap = useMemo(() => buildUserSettingsMap(userSettings), [userSettings]);

  const [pendingColors, setPendingColors] = useState<
    Record<string, Record<number, string>>
  >({});

  const [pendingLabels, setPendingLabels] = useState<
    Record<string, Record<number, string>>
  >({});

  const getDisplayColor = (sportId: string, level: number): string => {
    if (pendingColors[sportId]?.[level]) return pendingColors[sportId][level];
    const st = sportTypes.find((s) => s.id === sportId);
    return getEffortColor(st, level, settingsMap.get(sportId));
  };

  const getDisplayLabel = (sportId: string, level: number): string => {
    if (pendingLabels[sportId]?.[level]) return pendingLabels[sportId][level];
    const st = sportTypes.find((s) => s.id === sportId);
    return getEffortLabel(st, level, settingsMap.get(sportId));
  };

  const handleColorChange = (sportId: string, level: number, hex: string) => {
    setPendingColors((prev) => ({
      ...prev,
      [sportId]: { ...prev[sportId], [level]: hex },
    }));
  };

  const handleLabelChange = (sportId: string, level: number, label: string) => {
    setPendingLabels((prev) => ({
      ...prev,
      [sportId]: { ...prev[sportId], [level]: label },
    }));
  };

  const handleSaveColors = (sportId: string) => {
    const pendingC = pendingColors[sportId];
    const pendingL = pendingLabels[sportId];
    if (!pendingC && !pendingL) return;

    const st = sportTypes.find((s) => s.id === sportId);
    const existing = settingsMap.get(sportId);

    upsertSettings.mutate({
      sportTypeId: sportId,
      settings: {
        effort1Hex: pendingC?.[1] || existing?.effort1Hex || st?.effort1Hex,
        effort2Hex: pendingC?.[2] || existing?.effort2Hex || st?.effort2Hex,
        effort3Hex: pendingC?.[3] || existing?.effort3Hex || st?.effort3Hex,
        effort4Hex: pendingC?.[4] || existing?.effort4Hex || st?.effort4Hex,
        effort1Label: pendingL?.[1] || existing?.effort1Label || st?.effort1Label,
        effort2Label: pendingL?.[2] || existing?.effort2Label || st?.effort2Label,
        effort3Label: pendingL?.[3] || existing?.effort3Label || st?.effort3Label,
        effort4Label: pendingL?.[4] || existing?.effort4Label || st?.effort4Label,
      },
    });

    setPendingColors((prev) => {
      const next = { ...prev };
      delete next[sportId];
      return next;
    });
    setPendingLabels((prev) => {
      const next = { ...prev };
      delete next[sportId];
      return next;
    });
  };

  const handleResetColors = (sportId: string) => {
    const st = sportTypes.find((s) => s.id === sportId);
    if (!st) return;

    upsertSettings.mutate({
      sportTypeId: sportId,
      settings: {
        effort1Hex: st.effort1Hex,
        effort2Hex: st.effort2Hex,
        effort3Hex: st.effort3Hex,
        effort4Hex: st.effort4Hex,
        effort1Label: st.effort1Label,
        effort2Label: st.effort2Label,
        effort3Label: st.effort3Label,
        effort4Label: st.effort4Label,
      },
    });

    setPendingColors((prev) => {
      const next = { ...prev };
      delete next[sportId];
      return next;
    });
    setPendingLabels((prev) => {
      const next = { ...prev };
      delete next[sportId];
      return next;
    });
  };

  if (loadingSports || loadingSettings) {
    return (
      <div className="flex h-[calc(100vh-4.5rem)] items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading sport types...</div>
      </div>
    );
  }

  return (
    <div className="container-fixed">
      <div className="flex h-[calc(100vh-4.5rem)] flex-col gap-4 overflow-hidden lg:h-[calc(100vh-5rem)]">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between px-4 pt-2">
          <div>
            <h1 className="text-2xl font-black lowercase tracking-tighter lg:text-3xl">
              sport types
            </h1>
            <p className="text-muted-foreground text-xs">
              Customize effort level colors for each sport
            </p>
          </div>
        </header>

        {/* Sport type cards */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sportTypes.map((st) => {
              const hasPending = !!pendingColors[st.id] || !!pendingLabels[st.id];
              return (
                <div
                  key={st.id}
                  className="bg-card overflow-hidden rounded-2xl border shadow-sm transition-all hover:shadow-md"
                >
                  {/* Color strip */}
                  <div className="flex h-3">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className="flex-1"
                        style={{ backgroundColor: getDisplayColor(st.id, level) }}
                      />
                    ))}
                  </div>

                  <div className="p-5">
                    {/* Name & description */}
                    <div>
                      <h3 className="text-lg font-black lowercase tracking-tight">
                        {st.name}
                      </h3>
                      {st.description && (
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {st.description}
                        </p>
                      )}
                    </div>

                    {/* Pace info */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {st.paceRelevant ? (
                        <>
                          <span className="bg-muted inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                            <Ruler className="h-3 w-3" />
                            {st.distanceUnit || 'km'}
                          </span>
                          {st.paceUnit && (
                            <span className="bg-muted inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                              <Timer className="h-3 w-3" />
                              {st.paceUnit}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">
                          no pace tracking
                        </span>
                      )}
                    </div>

                    {/* Effort level color pickers */}
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((level) => {
                        const color = getDisplayColor(st.id, level);
                        const label = getDisplayLabel(st.id, level);
                        return (
                          <div key={level} className="flex flex-col gap-1.5">
                            <label className="relative cursor-pointer w-full">
                              <div
                                className={`flex h-16 w-full items-center justify-center rounded-lg text-sm font-black uppercase transition-all hover:scale-105 ${getContrastColor(color)}`}
                                style={{ backgroundColor: color }}
                              >
                                {level}
                              </div>
                              <input
                                type="color"
                                value={color}
                                onChange={(e) => handleColorChange(st.id, level, e.target.value)}
                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                              />
                            </label>
                            <Input
                              type="text"
                              value={label}
                              onChange={(e) => handleLabelChange(st.id, level, e.target.value)}
                              placeholder={`Level ${level}`}
                              className="h-7 text-center text-[10px] font-semibold"
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Save / Reset buttons */}
                    <div className="mt-4 flex gap-2">
                      {hasPending && (
                        <Button
                          size="sm"
                          onClick={() => handleSaveColors(st.id)}
                          className="flex-1 text-[10px] font-black lowercase"
                        >
                          save colors
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResetColors(st.id)}
                        className="gap-1 text-[10px] font-black lowercase"
                      >
                        <RotateCcw className="h-3 w-3" />
                        reset
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
