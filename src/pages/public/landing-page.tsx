import { useState } from 'react';
import { useAuth } from '@/auth/context/auth-context';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Activity, 
  Target, 
  LineChart, 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  FileUp,
  Download,
  Watch,
  CalendarPlus,
  Star,
  Plus
} from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';

export function LandingPage() {
  const { auth } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans selection:bg-success/30 select-none">
      
      {/* Background decoration elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-success/10 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse duration-[8000ms]"></div>
      <div className="absolute top-[20%] right-1/4 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none -z-10 animate-pulse duration-[10000ms]"></div>

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/50 dark:border-slate-800/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={toAbsoluteUrl('/media/app/default-logo.svg')}
              className="h-[36px] dark:hidden"
              alt="Logo"
            />
            <img
              src={toAbsoluteUrl('/media/app/default-logo-dark.svg')}
              className="h-[36px] hidden dark:block"
              alt="Logo"
            />
            <span className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
              Training<span className="text-success">Flow</span>
            </span>
          </div>



          <div className="hidden md:flex items-center gap-4">
            {auth?.access_token ? (
              <Link 
                to="/dashboard" 
                className="px-4 py-2 rounded-xl bg-success text-white font-bold hover:bg-success/90 shadow-md shadow-success/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link 
                  to="/auth/signin" 
                  className="text-sm font-semibold hover:text-success transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/auth/signup" 
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold hover:opacity-90 shadow-md transition-all cursor-pointer"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-success cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-950 px-4 py-6 space-y-4 animate-fade-in">


            <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-3">
              {auth?.access_token ? (
                <Link 
                  to="/dashboard" 
                  className="w-full text-center py-2.5 rounded-xl bg-success text-white font-bold hover:bg-success/90"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link 
                    to="/auth/signin" 
                    className="w-full text-center py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/auth/signup" 
                    className="w-full text-center py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-success/20 bg-success/5 text-success font-semibold text-xs animate-fade-in tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" /> Free Workout Planner
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-slate-950 dark:text-white max-w-4xl mx-auto leading-[1.1]">
          Structure Your Training.<br/>
          Build Your <span className="text-success relative inline-block">
            Plan
            <span className="absolute bottom-1.5 left-0 w-full h-[6px] bg-success/20 rounded"></span>
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
          Generate structured training phases, import workout templates, and log your activities in a unified, athlete-first training calendar.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {auth?.access_token ? (
            <Link 
              to="/dashboard" 
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-success text-white font-extrabold text-base hover:bg-success/90 shadow-lg shadow-success/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              Enter Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link 
                to="/auth/signup" 
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-success text-white font-extrabold text-base hover:bg-success/90 shadow-lg shadow-success/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Start Training Free <ArrowRight className="w-5 h-5" />
              </Link>
              <a 
                href="#features" 
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm font-bold text-base hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-center"
              >
                Explore Features
              </a>
            </>
          )}
        </div>

        {/* Dashboard Preview Container (Glassmorphic Mockup) */}
        <div className="relative pt-12 max-w-5xl mx-auto animate-fade-in delay-150">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent z-10 h-1/4 top-3/4"></div>
          <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40 p-3 shadow-2xl backdrop-blur-md overflow-hidden aspect-[16/10]">
            <div className="h-6 flex items-center gap-2 px-2 border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
              <span className="w-3 h-3 rounded-full bg-red-400"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
              <span className="w-3 h-3 rounded-full bg-green-400"></span>
              <span className="text-2xs text-muted-foreground ml-2 select-none">trainingflow.app/dashboard</span>
            </div>
            
            {/* Simulated Calendar UI inside browser frame */}
            <div className="p-4 flex flex-col h-full bg-slate-100/50 dark:bg-slate-950/50 overflow-y-auto text-left">
              {/* Calendar Header inside app */}
              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-3 mb-4 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-black lowercase tracking-tighter text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-1 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 px-1.5 py-0.5 rounded cursor-default select-none">
                      <span>may</span>
                      <span className="text-[7px] opacity-60">▼</span>
                    </div>
                    <div className="flex items-center gap-1 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 px-1.5 py-0.5 rounded cursor-default select-none text-muted-foreground">
                      <span>2026</span>
                      <span className="text-[7px] opacity-60">▼</span>
                    </div>
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex items-center gap-0.5 bg-slate-200/60 dark:bg-slate-800/60 p-0.5 rounded-lg border border-slate-200/30 dark:border-slate-800/30 text-[9px] font-extrabold select-none shrink-0">
                    <button className="p-0.5 px-1 hover:bg-white dark:hover:bg-slate-900 rounded cursor-default flex items-center justify-center">
                      <ChevronLeft className="w-2.5 h-2.5" />
                    </button>
                    <button className="px-2 py-0.5 hover:bg-white dark:hover:bg-slate-900 rounded text-muted-foreground uppercase cursor-default">
                      today
                    </button>
                    <button className="p-0.5 px-1 hover:bg-white dark:hover:bg-slate-900 rounded cursor-default flex items-center justify-center">
                      <ChevronRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>

                {/* Right side Action toolbar */}
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <button className="p-1 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded cursor-default"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                  <button className="p-1 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded cursor-default"><FileUp className="w-3.5 h-3.5" /></button>
                  <button className="p-1 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded cursor-default"><Download className="w-3.5 h-3.5" /></button>
                  <button className="p-1 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded cursor-default"><Watch className="w-3.5 h-3.5" /></button>
                  <div className="w-px h-4 bg-slate-300 dark:bg-slate-800 mx-1 shrink-0"></div>
                  <button className="px-2 py-0.5 border border-slate-300 dark:border-slate-800 hover:bg-slate-200/20 dark:hover:bg-slate-800/20 rounded text-[8px] font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider shrink-0 cursor-default flex items-center gap-1 select-none">
                    <CalendarPlus className="w-2.5 h-2.5" /> Apply Plan
                  </button>
                  <button className="px-2 py-0.5 bg-success hover:bg-success/95 text-white rounded text-[8px] font-black uppercase tracking-wider shrink-0 cursor-default flex items-center gap-1 shadow-sm select-none">
                    <BookOpen className="w-2.5 h-2.5" /> Library
                  </button>
                </div>
              </div>

              {/* Calendar Grid Container (8 columns: Mon-Sun + totals) */}
              <div className="grow flex flex-col space-y-1.5 min-h-0">
                {/* Days of Week Header */}
                <div className="grid grid-cols-8 text-center text-[9px] font-black tracking-widest pb-1 border-b border-slate-200/30 dark:border-slate-800/30 select-none">
                  <span className="text-muted-foreground">MON</span>
                  <span className="text-muted-foreground">TUE</span>
                  <span className="text-muted-foreground">WED</span>
                  <span className="text-muted-foreground">THU</span>
                  <span className="text-muted-foreground">FRI</span>
                  <span className="text-muted-foreground">SAT</span>
                  <span className="text-muted-foreground">SUN</span>
                  <span className="text-success dark:text-success lowercase">totals</span>
                </div>
                {/* Weeks rows */}
                <div className="grow grid grid-rows-2 gap-1.5 min-h-0">
                  {/* Week 1 */}
                  <div className="grid grid-cols-8 gap-1.5 h-full">
                    {/* Mon: Run (Key workout with star and left white border) */}
                    <div className="rounded-xl border border-slate-200/30 dark:border-slate-800/30 bg-white dark:bg-slate-900 p-1.5 text-left flex flex-col justify-between hover:border-success/30 transition-colors">
                      <span className="text-[9px] font-black text-muted-foreground">may 1</span>
                      <div className="bg-success text-white p-1 rounded-lg text-[9px] leading-tight space-y-0.5 relative pr-4 border-l-[3px] border-l-white/80 select-none">
                        <Star className="absolute top-1 right-1 w-2.5 h-2.5 fill-white text-white" />
                        <div className="font-extrabold flex items-center gap-0.5">
                          <Activity className="w-2.5 h-2.5 shrink-0 text-white" /> running
                        </div>
                        <div className="font-bold truncate">Endurance Run</div>
                        <div className="text-[8px] opacity-85 font-semibold">45m · 8.2km · 5:29/km</div>
                      </div>
                      <div className="text-[8px] font-black text-muted-foreground mt-1 border-t border-slate-100 dark:border-slate-800/50 pt-0.5">45m</div>
                    </div>
                    {/* Tue: Rest */}
                    <div className="rounded-xl border border-slate-200/30 dark:border-slate-800/30 bg-white/20 dark:bg-slate-900/20 p-1.5 text-left flex flex-col justify-between">
                      <span className="text-[9px] font-black text-muted-foreground">2</span>
                      <span className="text-3xs italic text-muted-foreground block text-center mt-3 select-none">Rest Day</span>
                    </div>
                    {/* Wed: Swim */}
                    <div className="rounded-xl border border-slate-200/30 dark:border-slate-800/30 bg-white dark:bg-slate-900 p-1.5 text-left flex flex-col justify-between hover:border-blue-500/30 transition-colors">
                      <span className="text-[9px] font-black text-muted-foreground">3</span>
                      <div className="bg-blue-500 text-white p-1 rounded-lg text-[9px] leading-tight space-y-0.5 select-none">
                        <div className="font-extrabold flex items-center gap-0.5">
                          <Activity className="w-2.5 h-2.5 shrink-0 text-white" /> swimming
                        </div>
                        <div className="font-bold truncate">Pool Session</div>
                        <div className="text-[8px] opacity-85 font-semibold">1h 00m · 2,500m</div>
                      </div>
                      <div className="text-[8px] font-black text-muted-foreground mt-1 border-t border-slate-100 dark:border-slate-800/50 pt-0.5">1h 00m</div>
                    </div>
                    {/* Thu: Bike */}
                    <div className="rounded-xl border border-slate-200/30 dark:border-slate-800/30 bg-white dark:bg-slate-900 p-1.5 text-left flex flex-col justify-between hover:border-amber-500/30 transition-colors">
                      <span className="text-[9px] font-black text-muted-foreground">4</span>
                      <div className="bg-amber-500 text-white p-1 rounded-lg text-[9px] leading-tight space-y-0.5 select-none">
                        <div className="font-extrabold flex items-center gap-0.5">
                          <Activity className="w-2.5 h-2.5 shrink-0 text-white" /> cycling
                        </div>
                        <div className="font-bold truncate">Tempo Ride</div>
                        <div className="text-[8px] opacity-85 font-semibold">1h 15m · 32.0km</div>
                      </div>
                      <div className="text-[8px] font-black text-muted-foreground mt-1 border-t border-slate-100 dark:border-slate-800/50 pt-0.5">1h 15m</div>
                    </div>
                    {/* Fri: Rest */}
                    <div className="rounded-xl border border-slate-200/30 dark:border-slate-800/30 bg-white/20 dark:bg-slate-900/20 p-1.5 text-left flex flex-col justify-between">
                      <span className="text-[9px] font-black text-muted-foreground">5</span>
                      <span className="text-3xs italic text-muted-foreground block text-center mt-3 select-none">Rest Day</span>
                    </div>
                    {/* Sat: Run */}
                    <div className="rounded-xl border border-slate-200/30 dark:border-slate-800/30 bg-white dark:bg-slate-900 p-1.5 text-left flex flex-col justify-between hover:border-success/30 transition-colors">
                      <span className="text-[9px] font-black text-muted-foreground">6</span>
                      <div className="bg-success text-white p-1 rounded-lg text-[9px] leading-tight space-y-0.5 select-none">
                        <div className="font-extrabold flex items-center gap-0.5">
                          <Activity className="w-2.5 h-2.5 shrink-0 text-white" /> running
                        </div>
                        <div className="font-bold truncate">Interval Run</div>
                        <div className="text-[8px] opacity-85 font-semibold">1h 30m · 18.0km</div>
                      </div>
                      <div className="text-[8px] font-black text-muted-foreground mt-1 border-t border-slate-100 dark:border-slate-800/50 pt-0.5">1h 30m</div>
                    </div>
                    {/* Sun: Bike */}
                    <div className="rounded-xl border border-slate-200/30 dark:border-slate-800/30 bg-white dark:bg-slate-900 p-1.5 text-left flex flex-col justify-between hover:border-amber-500/30 transition-colors">
                      <span className="text-[9px] font-black text-muted-foreground">7</span>
                      <div className="bg-amber-500 text-white p-1 rounded-lg text-[9px] leading-tight space-y-0.5 select-none">
                        <div className="font-extrabold flex items-center gap-0.5">
                          <Activity className="w-2.5 h-2.5 shrink-0 text-white" /> cycling
                        </div>
                        <div className="font-bold truncate">Long Ride</div>
                        <div className="text-[8px] opacity-85 font-semibold">3h 00m · 90.0km</div>
                      </div>
                      <div className="text-[8px] font-black text-muted-foreground mt-1 border-t border-slate-100 dark:border-slate-800/50 pt-0.5">3h 00m</div>
                    </div>
                    {/* Totals column cell 1 */}
                    <div className="rounded-xl border border-slate-200/30 dark:border-slate-800/30 bg-success/5 dark:bg-slate-900/40 p-2 text-left flex flex-col justify-between overflow-y-auto">
                      <div>
                        <span className="text-xs font-black text-success leading-none block">7h 30m</span>
                        <div className="border-t border-slate-200/50 dark:border-slate-800 mt-1 pt-1.5 space-y-2">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-success shrink-0"></span>
                              <span className="text-[7px] font-bold text-slate-500 uppercase">running</span>
                            </div>
                            <span className="text-[9px] font-black leading-none">2h 15m</span>
                            <span className="text-[8px] text-muted-foreground leading-none">26.2km</span>
                            <div className="mt-0.5 flex flex-col gap-0.5">
                              <div className="flex justify-between text-[6px] font-black uppercase text-success opacity-80">
                                <span>goal: 83%</span>
                                <span>30km</span>
                              </div>
                              <div className="h-0.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-success rounded-full" style={{ width: '83%' }}></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0"></span>
                              <span className="text-[7px] font-bold text-slate-500 uppercase">cycling</span>
                            </div>
                            <span className="text-[9px] font-black leading-none">4h 15m</span>
                            <span className="text-[8px] text-muted-foreground leading-none">122.0km</span>
                            <div className="mt-0.5 flex flex-col gap-0.5">
                              <div className="flex justify-between text-[6px] font-black uppercase text-success opacity-80">
                                <span>goal: 90%</span>
                                <span>150km</span>
                              </div>
                              <div className="h-0.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-success rounded-full" style={{ width: '90%' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Week 2 */}
                  <div className="grid grid-cols-8 gap-1.5 h-full">
                    {/* Mon: Rest */}
                    <div className="rounded-xl border border-slate-200/30 dark:border-slate-800/30 bg-white/20 dark:bg-slate-900/20 p-1.5 text-left flex flex-col justify-between">
                      <span className="text-[9px] font-black text-muted-foreground">may 8</span>
                      <span className="text-3xs italic text-muted-foreground block text-center mt-3 select-none">Rest Day</span>
                    </div>
                    {/* Tue: Note */}
                    <div className="rounded-xl border border-slate-200/30 dark:border-slate-800/30 bg-white dark:bg-slate-900 p-1.5 text-left flex flex-col justify-between hover:border-info/30 transition-colors">
                      <span className="text-[9px] font-black text-muted-foreground">9</span>
                      <div className="bg-info/10 text-info border border-info/30 p-1 rounded-lg text-[9px] leading-tight space-y-0.5 select-none">
                        <div className="font-extrabold uppercase text-[7px] tracking-wider">note</div>
                        <div className="text-muted-foreground text-[8px] line-clamp-3">Focus on cadence and core strength during recovery phase.</div>
                      </div>
                    </div>
                    {/* Wed: Swim */}
                    <div className="rounded-xl border border-slate-200/30 dark:border-slate-800/30 bg-white dark:bg-slate-900 p-1.5 text-left flex flex-col justify-between hover:border-blue-500/30 transition-colors">
                      <span className="text-[9px] font-black text-muted-foreground">10</span>
                      <div className="bg-blue-500 text-white p-1 rounded-lg text-[9px] leading-tight space-y-0.5 select-none">
                        <div className="font-extrabold flex items-center gap-0.5">
                          <Activity className="w-2.5 h-2.5 shrink-0 text-white" /> swimming
                        </div>
                        <div className="font-bold truncate">Interval Swim</div>
                        <div className="text-[8px] opacity-85 font-semibold">1h 00m · 2,200m</div>
                      </div>
                      <div className="text-[8px] font-black text-muted-foreground mt-1 border-t border-slate-100 dark:border-slate-800/50 pt-0.5">1h 00m</div>
                    </div>
                    {/* Thu: Run */}
                    <div className="rounded-xl border border-slate-200/30 dark:border-slate-800/30 bg-white dark:bg-slate-900 p-1.5 text-left flex flex-col justify-between hover:border-success/30 transition-colors">
                      <span className="text-[9px] font-black text-muted-foreground">11</span>
                      <div className="bg-success text-white p-1 rounded-lg text-[9px] leading-tight space-y-0.5 select-none">
                        <div className="font-extrabold flex items-center gap-0.5">
                          <Activity className="w-2.5 h-2.5 shrink-0 text-white" /> running
                        </div>
                        <div className="font-bold truncate">Tempo Run</div>
                        <div className="text-[8px] opacity-85 font-semibold">50m · 9.5km</div>
                      </div>
                      <div className="text-[8px] font-black text-muted-foreground mt-1 border-t border-slate-100 dark:border-slate-800/50 pt-0.5">50m</div>
                    </div>
                    {/* Fri: Rest */}
                    <div className="rounded-xl border border-slate-200/30 dark:border-slate-800/30 bg-white/20 dark:bg-slate-900/20 p-1.5 text-left flex flex-col justify-between">
                      <span className="text-[9px] font-black text-muted-foreground">12</span>
                      <span className="text-3xs italic text-muted-foreground block text-center mt-3 select-none">Rest Day</span>
                    </div>
                    {/* Sat: Brick */}
                    <div className="rounded-xl border border-slate-200/30 dark:border-slate-800/30 bg-white dark:bg-slate-900 p-1.5 text-left flex flex-col justify-between hover:border-orange-500/30 transition-colors">
                      <span className="text-[9px] font-black text-muted-foreground">13</span>
                      <div className="bg-orange-500 text-white p-1 rounded-lg text-[9px] leading-tight space-y-0.5 select-none">
                        <div className="font-extrabold flex items-center gap-0.5">
                          <Activity className="w-2.5 h-2.5 shrink-0 text-white" /> brick
                        </div>
                        <div className="font-bold truncate">Brick Session</div>
                        <div className="text-[8px] opacity-85 font-semibold">2h 00m · Bike + Run</div>
                      </div>
                      <div className="text-[8px] font-black text-muted-foreground mt-1 border-t border-slate-100 dark:border-slate-800/50 pt-0.5">2h 00m</div>
                    </div>
                    {/* Sun: Rest */}
                    <div className="rounded-xl border border-slate-200/30 dark:border-slate-800/30 bg-white/20 dark:bg-slate-900/20 p-1.5 text-left flex flex-col justify-between">
                      <span className="text-[9px] font-black text-muted-foreground">14</span>
                      <span className="text-3xs italic text-muted-foreground block text-center mt-3 select-none">Rest Day</span>
                    </div>
                    {/* Totals column cell 2 */}
                    <div className="rounded-xl border border-slate-200/30 dark:border-slate-800/30 bg-success/5 dark:bg-slate-900/40 p-2 text-left flex flex-col justify-between overflow-y-auto">
                      <div>
                        <span className="text-xs font-black text-success leading-none block">3h 50m</span>
                        <div className="border-t border-slate-200/50 dark:border-slate-800 mt-1 pt-1.5 space-y-2">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-success shrink-0"></span>
                              <span className="text-[7px] font-bold text-slate-500 uppercase">running</span>
                            </div>
                            <span className="text-[9px] font-black leading-none">50m</span>
                            <span className="text-[8px] text-muted-foreground leading-none">9.5km</span>
                            <div className="mt-0.5 flex flex-col gap-0.5">
                              <div className="flex justify-between text-[6px] font-black uppercase text-success opacity-80">
                                <span>goal: 40%</span>
                                <span>25km</span>
                              </div>
                              <div className="h-0.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-success rounded-full" style={{ width: '40%' }}></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-blue-500 shrink-0"></span>
                              <span className="text-[7px] font-bold text-slate-500 uppercase">swimming</span>
                            </div>
                            <span className="text-[9px] font-black leading-none">1h 00m</span>
                            <span className="text-[8px] text-muted-foreground leading-none">2,200m</span>
                            <div className="mt-0.5 flex flex-col gap-0.5">
                              <div className="flex justify-between text-[6px] font-black uppercase text-success opacity-80">
                                <span>goal: 88%</span>
                                <span>2,500m</span>
                              </div>
                              <div className="h-0.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-success rounded-full" style={{ width: '88%' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* Features Showcase Grid */}
      <section id="features" className="py-20 bg-slate-100/50 dark:bg-slate-900/30 border-y border-slate-200/50 dark:border-slate-800/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Engineered for Structured Planning</h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              TrainingFlow provides structured calendar scheduling, intelligent imports, and workout coordination without the clutter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 space-y-4 hover:shadow-xl hover:border-success/30 dark:hover:border-success/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Drag-and-Drop Calendar</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Easily structure workouts, reorder daily sessions, and copy/paste tasks across your week with instant stats recalculations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 space-y-4 hover:shadow-xl hover:border-success/30 dark:hover:border-success/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center group-hover:scale-110 transition-transform">
                <Watch className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Garmin CSV Import</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Import training logs directly from Garmin Connect CSV exports. Set custom activity mappings to align smartwatch data with your internal sports.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 space-y-4 hover:shadow-xl hover:border-success/30 dark:hover:border-success/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Periodized Goals</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Define weekly or monthly distance/duration targets. Track active completion rates via visual loading bars right on your calendar.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 space-y-4 hover:shadow-xl hover:border-success/30 dark:hover:border-success/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center group-hover:scale-110 transition-transform">
                <LineChart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Progression Tracking</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Monitor training volume and effort distributions over a customizable rolling timeframe. Highlight target event dates automatically.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 space-y-4 hover:shadow-xl hover:border-success/30 dark:hover:border-success/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center group-hover:scale-110 transition-transform">
                <CalendarPlus className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Periodized Plan Builder</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Generate structured taper schedules or base-building phases using a rule-based periodization engine. Map blocks forward from start dates or backward from target race dates.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 space-y-4 hover:shadow-xl hover:border-success/30 dark:hover:border-success/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Workout Library</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Save your favorite interval workouts or strength sessions. Drag templates onto the grid to schedule them in one click.
              </p>
            </div>
          </div>
        </div>
      </section>





      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-800/50 py-12 transition-colors mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500 font-medium">
          <div className="flex items-center gap-3">
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Training<span className="text-success">Flow</span>
            </span>
          </div>


          <p>© {new Date().getFullYear()} TrainingFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
