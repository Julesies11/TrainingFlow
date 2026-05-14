import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Calendar as CalendarIcon,
  CheckCircle2,
  ClipboardList,
  Copy,
  Download,
  FileUp,
  Info,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import {
  useCreateWorkoutsBulk,
  useSportTypes,
} from '@/hooks/use-training-data';
import { formatDateToLocalISO } from '@/services/training/calendar.utils';
import {
  anchorPlanToDate,
  convertDatesToCoordinates,
} from '@/services/training/import-export.utils';
import {
  parseImportData,
  ProcessedImportRow,
} from '@/services/training/import.utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { getImportPrompt } from '../constants/import-prompt';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport?: (workouts: Partial<Workout>[]) => void;
  templateMode?: boolean;
}

export function ImportDialog({
  open,
  onOpenChange,
  onImport,
  templateMode = false,
}: ImportDialogProps) {
  const { data: sportTypes = [] } = useSportTypes();
  const createWorkoutsBulk = useCreateWorkoutsBulk();
  const { copyToClipboard } = useCopyToClipboard();

  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [processedRows, setProcessedRows] = useState<ProcessedImportRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowStats] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Smart import state
  const [anchorDate, setAnchorDate] = useState(
    formatDateToLocalISO(new Date()),
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset state when opening
  useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open]);

  // Auto-scroll to bottom when tab changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
        scrollContainerRef.current?.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 100); // Increased delay to allow tab content to render
    }
  }, [activeTab]);

  const handleProcess = async (input: string, type: 'json' | 'csv') => {
    if (!input.trim()) return;

    setIsProcessing(true);
    setParseError(null);
    try {
      const results = await parseImportData(input, type, sportTypes);
      setProcessedRows(results);
      setShowStats(true);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to parse data';
      setParseError(message);
      toast.error('Check for parsing errors');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const extension = file.name.split('.').pop()?.toLowerCase();
      const type = extension === 'csv' ? 'csv' : 'json';
      handleProcess(content, type);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    let validWorkouts = processedRows
      .filter((r) => r.isValid && r.workout)
      .map((r) => ({ ...r.workout! }));

    if (validWorkouts.length === 0) {
      toast.error('No valid workouts to import');
      return;
    }

    // --- Smart Bi-directional Logic ---
    if (!templateMode) {
      validWorkouts = anchorPlanToDate(validWorkouts, anchorDate);
    } else {
      validWorkouts = convertDatesToCoordinates(validWorkouts);
    }

    if (onImport) {
      onImport(validWorkouts as unknown);
      toast.success(`Successfully imported ${validWorkouts.length} workouts`);
      onOpenChange(false);
      return;
    }

    createWorkoutsBulk.mutate(validWorkouts as unknown, {
      onSuccess: () => {
        toast.success(`Successfully imported ${validWorkouts.length} workouts`);
        onOpenChange(false);
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to import workouts');
      },
    });
  };

  const resetState = () => {
    setProcessedRows([]);
    setShowStats(false);
    setPastedText('');
    setParseError(null);
    setActiveTab('upload');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopyPrompt = () => {
    copyToClipboard(getImportPrompt(sportTypes));
    toast.success('AI prompt copied to clipboard');
  };

  const handleDownloadTemplate = () => {
    const headers = templateMode
      ? [
          'weekNumber',
          'dayOfWeek',
          'sportName',
          'title',
          'description',
          'plannedDurationMinutes',
          'plannedDistanceKilometers',
          'effortLevel',
          'isKeyWorkout',
        ]
      : [
          'date',
          'sportName',
          'title',
          'description',
          'plannedDurationMinutes',
          'plannedDistanceKilometers',
          'effortLevel',
          'isKeyWorkout',
        ];
    const sampleRow = templateMode
      ? [
          '1',
          '1',
          sportTypes[0]?.name || 'Sport',
          'Sample Workout',
          'Description of the session',
          '60',
          '10',
          '2',
          'false',
        ]
      : [
          new Date().toISOString().split('T')[0],
          sportTypes[0]?.name || 'Sport',
          'Sample Workout',
          'Description of the session',
          '60',
          '10',
          '2',
          'false',
        ];
    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'training_plan_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const validCount = processedRows.filter((r) => r.isValid).length;
  const totalCount = processedRows.length;
  const hasErrors = totalCount > validCount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] md:w-full max-h-[95vh] md:max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <>
          <DialogHeader className="px-4 py-3 md:px-6 md:py-4 border-b">
            <DialogTitle className="text-lg md:text-xl font-black lowercase tracking-tight">
              import training plan
            </DialogTitle>
            <DialogDescription className="sr-only">
              Import training plans from AI-generated files or text.
            </DialogDescription>
          </DialogHeader>

          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-4 py-2 md:px-6 md:py-3"
          >
            {!showPreview ? (
              <div className="space-y-4">
                <div className="bg-primary/5 rounded-xl border border-primary/10 p-3 md:p-4">
                  <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-3">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black lowercase text-primary flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        instruction guide
                      </h4>
                      <p className="text-xs font-medium text-primary/80 leading-relaxed max-w-prose">
                        Use AI to build your perfect training program. Simply
                        copy the prompt template below, fill in your goal
                        details, and ask an AI assistant (like ChatGPT or
                        Claude) for a CSV file. When finished, upload the file
                        or paste the raw text below to import your sessions
                        instantly.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyPrompt}
                        className="h-8 text-[10px] font-black uppercase tracking-widest gap-2 bg-background border-primary/20 hover:bg-primary/5 w-full sm:w-auto"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        copy AI prompt
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadTemplate}
                        className="h-8 text-[10px] font-black uppercase tracking-widest gap-2 bg-background border-primary/20 hover:bg-primary/5 w-full sm:w-auto"
                      >
                        <Download className="h-3.5 w-3.5" />
                        csv template
                      </Button>
                    </div>
                  </div>

                  <div className="">
                    <span className="text-[10px] font-black uppercase text-primary/60 block mb-1.5">
                      AI prompt template (copy & paste this)
                    </span>
                    <Textarea
                      readOnly
                      value={getImportPrompt(sportTypes)}
                      className="min-h-[120px] md:min-h-[160px] text-[11px] font-mono bg-background/50 border-primary/10 resize-none overflow-y-auto leading-relaxed"
                    />
                  </div>
                </div>

                {parseError && (
                  <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 flex gap-3 text-danger text-sm mb-6">
                    <AlertCircle className="size-5 shrink-0" />
                    <div className="space-y-1">
                      <p className="font-bold lowercase">parsing error</p>
                      <p className="text-xs opacity-90">{parseError}</p>
                    </div>
                  </div>
                )}

                <Tabs
                  value={activeTab}
                  onValueChange={(v: string) =>
                    setActiveTab(v as 'upload' | 'paste')
                  }
                  className="w-full"
                >
                  <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 mb-6">
                    <TabsTrigger
                      value="upload"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 md:px-6 py-3 text-xs md:text-sm"
                    >
                      <FileUp className="h-4 w-4 mr-2" />
                      upload file
                    </TabsTrigger>
                    <TabsTrigger
                      value="paste"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 md:px-6 py-3 text-xs md:text-sm"
                    >
                      <ClipboardList className="h-4 w-4 mr-2" />
                      paste text
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="mt-0">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 transition-colors group"
                    >
                      <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FileUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                      </div>
                      <p className="text-xs md:text-sm font-bold text-foreground mb-1 lowercase">
                        click or drag and drop to upload
                      </p>
                      <p className="text-[10px] md:text-xs text-muted-foreground lowercase">
                        support for .json and .csv files
                      </p>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".json,.csv"
                        className="hidden"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="paste" className="mt-0 space-y-4">
                    <Textarea
                      placeholder="paste your CSV (date,sportName,title...) or JSON here"
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      className="min-h-[150px] md:min-h-[200px] font-mono text-xs"
                    />
                    <Button
                      onClick={() => {
                        const type = pastedText.trim().startsWith('[')
                          ? 'json'
                          : 'csv';
                        handleProcess(pastedText, type);
                      }}
                      disabled={!pastedText.trim() || isProcessing}
                      className="w-full h-11 font-bold lowercase"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        'process text'
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm md:text-base font-black lowercase tracking-tight">
                      preview workouts
                    </h3>
                    <span className="text-[9px] md:text-[10px] font-bold bg-muted px-2 py-0.5 rounded-full">
                      {validCount} / {totalCount} valid
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowStats(false)}
                    className="h-8 text-[10px] md:text-xs font-bold lowercase"
                  >
                    back to input
                  </Button>
                </div>

                {hasErrors && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-[10px] md:text-xs font-bold">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      Warning: {totalCount - validCount} rows failed validation.
                      Please review the highlighted errors below.
                    </div>
                    {processedRows.some((r) =>
                      r.errors.some((e) => e.includes('Too many fields')),
                    ) && (
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-[10px] md:text-xs text-primary/80">
                        <p className="font-bold flex items-center gap-1.5 mb-1">
                          <Info className="h-3 w-3" />
                          Troubleshooting Tip
                        </p>
                        <p>
                          Some rows have "Too many fields". This usually happens
                          when a description contains a comma but isn't wrapped
                          in quotes (e.g.,{' '}
                          <code>"Power focus, reduced load"</code>). Please
                          ensure all columns are correctly separated.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {!templateMode &&
                  processedRows.some(
                    (r) =>
                      r.isValid && !r.workout?.date && r.workout?.weekNumber,
                  ) && (
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-black lowercase text-primary">
                          anchor to calendar
                        </h4>
                      </div>
                      <p className="text-xs font-medium text-primary/80">
                        We detected a training plan (relative weeks/days) rather
                        than absolute dates. Select the start date to anchor
                        this plan to your calendar.
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="max-w-[200px] w-full">
                          <Label
                            htmlFor="anchorDate"
                            className="text-[10px] font-black uppercase text-primary/60 mb-1 block"
                          >
                            plan start date
                          </Label>
                          <Input
                            id="anchorDate"
                            type="date"
                            value={anchorDate}
                            onChange={(e) => setAnchorDate(e.target.value)}
                            className="bg-background border-primary/20 h-9 text-xs"
                          />
                        </div>
                        <div className="text-[10px] font-medium text-primary/60 mt-4 italic">
                          * Plan will start from the Monday of this week.
                        </div>
                      </div>
                    </div>
                  )}

                <div className="border rounded-xl overflow-x-auto">
                  <div className="min-w-[600px] md:min-w-0">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          {templateMode ? (
                            <>
                              <TableHead className="w-[80px] text-[10px] font-black uppercase">
                                week no
                              </TableHead>
                              <TableHead className="w-[100px] text-[10px] font-black uppercase">
                                day
                              </TableHead>
                            </>
                          ) : (
                            <TableHead className="w-[120px] text-[10px] font-black uppercase">
                              date
                            </TableHead>
                          )}
                          <TableHead className="w-[100px] text-[10px] font-black uppercase">
                            sport
                          </TableHead>
                          <TableHead className="text-[10px] font-black uppercase">
                            title
                          </TableHead>
                          <TableHead className="w-[80px] text-[10px] font-black uppercase">
                            dur (m)
                          </TableHead>
                          <TableHead className="w-[40px] text-[10px] font-black uppercase"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {processedRows.map((row, idx) => (
                          <React.Fragment key={idx}>
                            <TableRow
                              className={
                                !row.isValid
                                  ? 'bg-destructive/5 hover:bg-destructive/10'
                                  : ''
                              }
                            >
                              {templateMode ? (
                                <>
                                  <TableCell className="text-xs font-medium py-3">
                                    {row.row.weekNumber || '---'}
                                  </TableCell>
                                  <TableCell className="text-xs font-medium py-3">
                                    {row.row.dayOfWeek
                                      ? [
                                          'mon',
                                          'tue',
                                          'wed',
                                          'thu',
                                          'fri',
                                          'sat',
                                          'sun',
                                        ][row.row.dayOfWeek - 1]
                                      : '---'}
                                  </TableCell>
                                </>
                              ) : (
                                <TableCell className="text-xs font-medium py-3">
                                  {row.row.date || '---'}
                                </TableCell>
                              )}
                              <TableCell className="text-xs py-3">
                                <span
                                  className={
                                    !row.isValid &&
                                    row.errors.some((e) => e.includes('Sport'))
                                      ? 'text-destructive font-bold'
                                      : ''
                                  }
                                >
                                  {row.row.sportName || '---'}
                                </span>
                              </TableCell>
                              <TableCell className="text-xs py-3 truncate max-w-[200px]">
                                {row.row.title || '---'}
                              </TableCell>
                              <TableCell className="text-xs py-3 font-mono">
                                {row.row.plannedDurationMinutes || 0}
                              </TableCell>
                              <TableCell className="py-3">
                                {row.isValid ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-destructive" />
                                )}
                              </TableCell>
                            </TableRow>
                            {!row.isValid && row.errors.length > 0 && (
                              <TableRow className="bg-destructive/5 hover:bg-destructive/10">
                                <TableCell
                                  colSpan={5}
                                  className="py-0 px-3 pb-3"
                                >
                                  <div className="text-[10px] font-bold text-destructive flex flex-col gap-0.5">
                                    {row.errors.map((err, i) => (
                                      <span
                                        key={i}
                                        className="flex items-center gap-1"
                                      >
                                        • {err}
                                      </span>
                                    ))}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="px-4 py-3 md:px-6 md:py-4 border-t bg-muted/30 flex flex-col sm:flex-row gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="font-bold lowercase w-full sm:w-auto"
            >
              cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={
                !showPreview || validCount === 0 || createWorkoutsBulk.isPending
              }
              className="font-bold lowercase min-w-[120px] w-full sm:w-auto"
            >
              {createWorkoutsBulk.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                `import ${validCount} workouts`
              )}
            </Button>
          </DialogFooter>
        </>
      </DialogContent>
    </Dialog>
  );
}
