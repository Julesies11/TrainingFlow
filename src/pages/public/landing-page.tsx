import { useAuth } from '@/auth/context/auth-context';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  Activity, 
  Target, 
  LineChart, 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  ChevronLeft,
  ChevronRight,
  Watch,
  Star,
  Layers,
  Plus,
  Search,
  CheckCircle2,
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';

export function LandingPage() {
  const { auth } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans selection:bg-success/30 select-none overflow-x-hidden w-full relative">
      
      {/* Background decoration elements */}
      <div className="hidden sm:block absolute top-0 left-1/4 w-[500px] h-[500px] bg-success/10 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse duration-[8000ms]"></div>
      <div className="hidden sm:block absolute top-[20%] right-1/4 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none -z-10 animate-pulse duration-[10000ms]"></div>

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

          <div className="flex items-center gap-2 sm:gap-4">
            <Link 
              to={auth?.access_token ? "/dashboard" : "/auth/signin"}
              className="px-4 py-2 rounded-xl bg-success text-white font-bold hover:bg-success/90 shadow-md shadow-success/20 transition-all text-xs sm:text-sm cursor-pointer"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-6 md:pt-20 md:pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-success/20 bg-success/5 text-success font-semibold text-xs animate-fade-in tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" /> Free Workout Planner
        </div>
        
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tight text-slate-950 dark:text-white max-w-4xl mx-auto leading-[1.1]">
          Structure Your Training. <br className="hidden md:block" />
          Build Your <span className="text-success relative inline-block">
            Plan
            <span className="absolute bottom-1.5 left-0 w-full h-[6px] bg-success/20 rounded"></span>
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
          Generate structured training phases, import workout templates, and log your activities in a unified, athlete-first training calendar.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link 
            to={auth?.access_token ? "/dashboard" : "/auth/signup"} 
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-success text-white font-extrabold text-base hover:bg-success/90 shadow-lg shadow-success/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            Register for free <ArrowRight className="w-5 h-5" />
          </Link>
          <a 
            href="#features" 
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm font-bold text-base hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-center"
          >
            Explore Features
          </a>
        </div>
      </section>

      {/* Vertical Feature Showcases (Alternating Z-Pattern Layout) */}
      <section id="features" className="pt-4 pb-16 md:pt-6 md:pb-24 space-y-20 md:space-y-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Feature 1: Interactive Training Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-5 space-y-5 text-left">
            <span className="px-3 py-1 rounded-full bg-success/10 text-success text-xs font-black uppercase tracking-wider inline-block">
              Interactive Calendar
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 dark:text-white">
              Plan Every Session with Precision
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed font-medium">
              View your entire training block at a glance with a clean 8-column calendar. Easily track daily workouts, rest days, coach notes, and target race events.
            </p>
            <ul className="space-y-3 pt-2">
              <li className="flex items-start gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <span>Drag & drop workouts with instant weekly totals recalculation.</span>
              </li>
              <li className="flex items-start gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <span>Visual goal completion bars per sport type.</span>
              </li>
              <li className="flex items-start gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <span>Seamless integration of rest days and workout notes.</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-300/80 bg-white shadow-2xl overflow-hidden text-slate-900">
              <div className="h-7 flex items-center gap-2 px-3 border-b border-slate-200 bg-slate-100/90 select-none">
                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                <span className="w-3 h-3 rounded-full bg-green-400"></span>
                <span className="text-xs font-semibold text-slate-500 ml-2">trainingflow.app/calendar</span>
              </div>
              <div className="p-4 bg-white text-left overflow-x-auto">
                <div className="min-w-[640px] lg:min-w-0">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-black lowercase tracking-tighter text-slate-900">may 2026</h2>
                      <div className="bg-slate-100 flex items-center gap-0.5 rounded-xl border border-slate-200 p-0.5">
                        <button className="h-6 w-6 rounded-lg hover:bg-white flex items-center justify-center text-slate-700">
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </button>
                        <button className="px-2 text-[9px] font-black uppercase text-slate-700 hover:bg-white rounded-lg h-6">today</button>
                        <button className="h-6 w-6 rounded-lg hover:bg-white flex items-center justify-center text-slate-700">
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-100 flex rounded-xl p-0.5 border border-slate-200">
                        <span className="px-2.5 py-0.5 bg-success text-white rounded-lg text-[9px] font-black uppercase">grid</span>
                        <span className="px-2.5 py-0.5 text-slate-600 rounded-lg text-[9px] font-black uppercase">stats</span>
                      </div>
                    </div>
                  </div>

                  {/* Calendar Grid Days (2 Weeks) */}
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-8 text-center text-[8px] font-black tracking-widest text-slate-400 pb-1 border-b border-slate-100">
                      <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span><span>SUMMARY</span>
                    </div>
                    
                    {/* Week 1 (May 1 - May 7) */}
                    <div className="grid grid-cols-8 gap-1.5">
                      <div className="rounded-xl border border-slate-200 bg-white p-1.5 min-h-[85px] flex flex-col justify-between shadow-2xs">
                        <span className="text-[9px] font-black text-slate-400">MAY 1</span>
                        <div className="bg-[#EF4444] text-white p-1 rounded-lg text-[8px] space-y-0.5">
                          <div className="font-extrabold flex items-center gap-0.5"><Activity className="w-2 h-2" /> RUN</div>
                          <div className="font-bold truncate">Interval Session</div>
                          <div className="opacity-90">45m · 8.5km</div>
                        </div>
                        <div className="text-[8px] font-black text-slate-400 border-t pt-0.5">45m</div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-1.5 min-h-[85px] flex flex-col justify-between shadow-2xs">
                        <span className="text-[9px] font-black text-slate-400">2</span>
                        <div className="bg-[#FACC15] text-slate-950 p-1 rounded-lg text-[8px] space-y-0.5">
                          <div className="font-extrabold flex items-center gap-0.5"><Activity className="w-2 h-2" /> BIKE</div>
                          <div className="font-bold truncate">Sweetspot Ride</div>
                          <div className="opacity-90">1h 15m · 32.0km</div>
                        </div>
                        <div className="text-[8px] font-black text-slate-400 border-t pt-0.5">1h 15m</div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-1.5 min-h-[85px] flex flex-col justify-between shadow-2xs">
                        <span className="text-[9px] font-black text-slate-400">3</span>
                        <div className="bg-[#3B82F6] text-white p-1 rounded-lg text-[8px] space-y-0.5">
                          <div className="font-extrabold flex items-center gap-0.5"><Activity className="w-2 h-2" /> SWIM</div>
                          <div className="font-bold truncate">Technique Sets</div>
                          <div className="opacity-90">1h 00m · 2,400m</div>
                        </div>
                        <div className="text-[8px] font-black text-slate-400 border-t pt-0.5">1h 00m</div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-1.5 min-h-[85px] flex flex-col justify-between">
                        <span className="text-[9px] font-black text-slate-400">4</span>
                        <span className="text-[9px] italic text-slate-400 text-center my-auto">Rest Day</span>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-1.5 min-h-[85px] flex flex-col justify-between shadow-2xs">
                        <span className="text-[9px] font-black text-slate-400">5</span>
                        <div className="bg-[#22C55E] text-white p-1 rounded-lg text-[8px] space-y-0.5">
                          <div className="font-extrabold flex items-center gap-0.5"><Activity className="w-2 h-2" /> STRENGTH</div>
                          <div className="font-bold truncate">Leg Power & Core</div>
                          <div className="opacity-90">45m</div>
                        </div>
                        <div className="text-[8px] font-black text-slate-400 border-t pt-0.5">45m</div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-1.5 min-h-[85px] flex flex-col justify-between shadow-2xs">
                        <span className="text-[9px] font-black text-slate-400">6</span>
                        <div className="bg-[#EF4444] text-white p-1 rounded-lg text-[8px] space-y-0.5">
                          <div className="font-extrabold flex items-center gap-0.5"><Activity className="w-2 h-2" /> RUN</div>
                          <div className="font-bold truncate">Long Endurance</div>
                          <div className="opacity-90">1h 30m · 18.0km</div>
                        </div>
                        <div className="text-[8px] font-black text-slate-400 border-t pt-0.5">1h 30m</div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-1.5 min-h-[85px] flex flex-col justify-between shadow-2xs">
                        <span className="text-[9px] font-black text-slate-400">7</span>
                        <div className="bg-[#FACC15] text-slate-950 p-1 rounded-lg text-[8px] space-y-0.5">
                          <div className="font-extrabold flex items-center gap-0.5"><Activity className="w-2 h-2" /> BIKE</div>
                          <div className="font-bold truncate">Zone 2 Long Ride</div>
                          <div className="opacity-90">2h 30m · 65.0km</div>
                        </div>
                        <div className="text-[8px] font-black text-slate-400 border-t pt-0.5">2h 30m</div>
                      </div>

                      {/* Week 1 Summary Card */}
                      <div className="rounded-xl border border-slate-200 bg-success/5 p-1.5 flex flex-col justify-between">
                        <div>
                          <span className="text-[8px] font-black text-slate-400 block uppercase">WK 1</span>
                          <span className="text-xs font-black text-success">7h 45m</span>
                        </div>
                        <div className="space-y-1 border-t pt-1">
                          <div className="space-y-0.5">
                            <div className="flex justify-between text-[7px] font-black uppercase text-slate-600"><span>run</span><span>26.5km</span></div>
                            <div className="h-1 bg-slate-200 rounded-full"><div className="h-full bg-[#EF4444] rounded-full" style={{ width: '80%' }} /></div>
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex justify-between text-[7px] font-black uppercase text-slate-600"><span>bike</span><span>97.0km</span></div>
                            <div className="h-1 bg-slate-200 rounded-full"><div className="h-full bg-[#FACC15] rounded-full" style={{ width: '90%' }} /></div>
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex justify-between text-[7px] font-black uppercase text-slate-600"><span>swim</span><span>2.4km</span></div>
                            <div className="h-1 bg-slate-200 rounded-full"><div className="h-full bg-[#3B82F6] rounded-full" style={{ width: '60%' }} /></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Week 2 (May 8 - May 14) */}
                    <div className="grid grid-cols-8 gap-1.5">
                      <div className="rounded-xl border border-slate-200 bg-amber-50/50 p-1.5 min-h-[85px] flex flex-col justify-between">
                        <span className="text-[9px] font-black text-slate-400">8</span>
                        <span className="text-[8px] italic font-semibold text-amber-700 text-center my-auto">Cadence & Hydration Focus</span>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-1.5 min-h-[85px] flex flex-col justify-between shadow-2xs">
                        <span className="text-[9px] font-black text-slate-400">9</span>
                        <div className="bg-[#3B82F6] text-white p-1 rounded-lg text-[8px] space-y-0.5">
                          <div className="font-extrabold flex items-center gap-0.5"><Activity className="w-2 h-2" /> SWIM</div>
                          <div className="font-bold truncate">Aerobic Threshold</div>
                          <div className="opacity-90">1h 00m · 2,200m</div>
                        </div>
                        <div className="text-[8px] font-black text-slate-400 border-t pt-0.5">1h 00m</div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-1.5 min-h-[85px] flex flex-col justify-between shadow-2xs">
                        <span className="text-[9px] font-black text-slate-400">10</span>
                        <div className="bg-[#EF4444] text-white p-1 rounded-lg text-[8px] space-y-0.5">
                          <div className="font-extrabold flex items-center gap-0.5"><Activity className="w-2 h-2" /> RUN</div>
                          <div className="font-bold truncate">Tempo Strides</div>
                          <div className="opacity-90">50m · 9.5km</div>
                        </div>
                        <div className="text-[8px] font-black text-slate-400 border-t pt-0.5">50m</div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-1.5 min-h-[85px] flex flex-col justify-between">
                        <span className="text-[9px] font-black text-slate-400">11</span>
                        <span className="text-[9px] italic text-slate-400 text-center my-auto">Rest Day</span>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-1.5 min-h-[85px] flex flex-col justify-between shadow-2xs">
                        <span className="text-[9px] font-black text-slate-400">12</span>
                        <div className="bg-[#FACC15] text-slate-950 p-1 rounded-lg text-[8px] space-y-0.5">
                          <div className="font-extrabold flex items-center gap-0.5"><Activity className="w-2 h-2" /> BIKE</div>
                          <div className="font-bold truncate">Hill Repeats</div>
                          <div className="opacity-90">1h 45m · 48.0km</div>
                        </div>
                        <div className="text-[8px] font-black text-slate-400 border-t pt-0.5">1h 45m</div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-1.5 min-h-[85px] flex flex-col justify-between shadow-2xs">
                        <span className="text-[9px] font-black text-slate-400">13</span>
                        <div className="bg-[#EF4444] text-white p-1 rounded-lg text-[8px] space-y-0.5">
                          <div className="font-extrabold flex items-center gap-0.5"><Activity className="w-2 h-2" /> RUN</div>
                          <div className="font-bold truncate">Progressive Run</div>
                          <div className="opacity-90">1h 15m · 13.5km</div>
                        </div>
                        <div className="text-[8px] font-black text-slate-400 border-t pt-0.5">1h 15m</div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-1.5 min-h-[85px] flex flex-col justify-between shadow-2xs">
                        <span className="text-[9px] font-black text-slate-400">14</span>
                        <div className="bg-[#FACC15] text-slate-950 p-1 rounded-lg text-[8px] space-y-0.5">
                          <div className="font-extrabold flex items-center gap-0.5"><Activity className="w-2 h-2" /> BIKE</div>
                          <div className="font-bold truncate">Over/Under Intervals</div>
                          <div className="opacity-90">3h 00m · 80.0km</div>
                        </div>
                        <div className="text-[8px] font-black text-slate-400 border-t pt-0.5">3h 00m</div>
                      </div>

                      {/* Week 2 Summary Card */}
                      <div className="rounded-xl border border-slate-200 bg-success/5 p-1.5 flex flex-col justify-between">
                        <div>
                          <span className="text-[8px] font-black text-slate-400 block uppercase">WK 2</span>
                          <span className="text-xs font-black text-success">7h 50m</span>
                        </div>
                        <div className="space-y-1 border-t pt-1">
                          <div className="space-y-0.5">
                            <div className="flex justify-between text-[7px] font-black uppercase text-slate-600"><span>run</span><span>23.0km</span></div>
                            <div className="h-1 bg-slate-200 rounded-full"><div className="h-full bg-[#EF4444] rounded-full" style={{ width: '70%' }} /></div>
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex justify-between text-[7px] font-black uppercase text-slate-600"><span>bike</span><span>128.0km</span></div>
                            <div className="h-1 bg-slate-200 rounded-full"><div className="h-full bg-[#FACC15] rounded-full" style={{ width: '95%' }} /></div>
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex justify-between text-[7px] font-black uppercase text-slate-600"><span>swim</span><span>2.2km</span></div>
                            <div className="h-1 bg-slate-200 rounded-full"><div className="h-full bg-[#3B82F6] rounded-full" style={{ width: '55%' }} /></div>
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

        {/* Feature 2: Athlete Dashboard & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <div className="lg:col-span-7 lg:order-1 order-2">
            <div className="rounded-2xl border border-slate-300/80 bg-white shadow-2xl overflow-hidden text-slate-900">
              <div className="h-7 flex items-center gap-2 px-3 border-b border-slate-200 bg-slate-100/90 select-none">
                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                <span className="w-3 h-3 rounded-full bg-green-400"></span>
                <span className="text-xs font-semibold text-slate-500 ml-2">trainingflow.app/dashboard</span>
              </div>
              <div className="p-4 bg-slate-50 space-y-4 text-left">
                {/* Volume Summary Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-black lowercase text-slate-900">volume summary</span>
                    </div>
                    <span className="text-[9px] font-bold uppercase text-slate-400">rolling 12 weeks</span>
                  </div>

                  {/* SVG Line & Area Chart */}
                  <div className="relative h-36 w-full border-b border-l border-slate-200 pl-6 pb-5">
                    <div className="absolute left-0 top-0 bottom-5 flex flex-col justify-between text-[8px] font-bold text-slate-400 text-right w-4">
                      <span>20h</span><span>10h</span><span>0h</span>
                    </div>

                    {/* Annotations */}
                    <div className="absolute left-[40%] top-0 bottom-5 border-r-2 border-dashed border-amber-500 z-10">
                      <span className="absolute -top-3 -left-10 bg-amber-500 text-white text-[7px] font-bold px-1 rounded">
                        70.3 Race
                      </span>
                    </div>

                    <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="fGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Target line */}
                      <path d="M 0,60 L 150,60 L 150,40 L 300,40 L 300,70 L 500,70" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4,4" />

                      {/* Past Area & Line */}
                      <path d="M 0,120 L 0,90 Q 75,70 150,45 T 260,30 L 260,120 Z" fill="url(#pGrad)" />
                      <path d="M 0,90 Q 75,70 150,45 T 260,30" fill="none" stroke="#3b82f6" strokeWidth="2.5" />

                      {/* Future Area & Line */}
                      <path d="M 260,120 L 260,30 Q 350,55 420,80 T 500,95 L 500,120 Z" fill="url(#fGrad)" />
                      <path d="M 260,30 Q 350,55 420,80 T 500,95" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeDasharray="4,3" />
                    </svg>

                    <div className="absolute inset-x-6 -bottom-4 flex justify-between text-[7px] font-bold text-slate-400">
                      <span>06 Apr</span><span>20 Apr</span><span className="text-blue-600 font-extrabold">18 May</span><span>01 Jun</span><span>15 Jun</span>
                    </div>
                  </div>

                  {/* Chart Legend */}
                  <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-5 pt-1.5 border-t border-slate-100 text-[9px] font-bold text-slate-600">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-[#3b82f6] rounded" /> Past Volume</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-[#8b5cf6] rounded" /> Future Projected</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-[#ef4444]" /> Target Goal</span>
                  </div>
                </div>

                {/* Mini Distributions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-black lowercase block text-slate-900">sport distribution</span>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-bold"><span className="lowercase">cycling</span><span>6h 30m (45%)</span></div>
                      <div className="h-1 bg-slate-100 rounded-full"><div className="h-full bg-[#FACC15] rounded-full" style={{ width: '45%' }} /></div>
                      <div className="flex justify-between text-[8px] font-bold"><span className="lowercase">running</span><span>4h 10m (29%)</span></div>
                      <div className="h-1 bg-slate-100 rounded-full"><div className="h-full bg-[#EF4444] rounded-full" style={{ width: '29%' }} /></div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-black lowercase block text-slate-900">effort distribution</span>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-bold"><span>L1 - Easy</span><span>6h 45m (48%)</span></div>
                      <div className="h-1 bg-slate-100 rounded-full"><div className="h-full bg-blue-400 rounded-full" style={{ width: '48%' }} /></div>
                      <div className="flex justify-between text-[8px] font-bold"><span>L2 - Aerobic</span><span>4h 30m (32%)</span></div>
                      <div className="h-1 bg-slate-100 rounded-full"><div className="h-full bg-emerald-500 rounded-full" style={{ width: '32%' }} /></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5 text-left lg:order-2 order-1">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider inline-block">
              Volume & Performance
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 dark:text-white">
              Track Load, Volume, and Intensity Trends
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed font-medium">
              Gain deep insight into your training adaptation. Analyze past volume against future projected load with automatic sport and intensity breakdowns.
            </p>
            <ul className="space-y-3 pt-2">
              <li className="flex items-start gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <span>Seamlessly compare completed training against target goals.</span>
              </li>
              <li className="flex items-start gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <span>Multi-sport time & distance aggregation.</span>
              </li>
              <li className="flex items-start gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <span>4-zone effort intensity distribution tracking.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Feature 3: Free Training Plans & Generator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-5 space-y-5 text-left">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider inline-block">
              Free Training Plans
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 dark:text-white">
              Periodized Plans for Any Race
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed font-medium">
              Choose from pre-built periodized plan templates or generate custom training blocks. Automatically calculate base building, peak volume, and taper curves.
            </p>
            <ul className="space-y-3 pt-2">
              <li className="flex items-start gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <span>Structured periodization for 70.3, Marathons, and Olympic tris.</span>
              </li>
              <li className="flex items-start gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <span>One-click projection directly onto your active calendar.</span>
              </li>
              <li className="flex items-start gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <span>Automated 3-week taper calculations for A-race events.</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-300/80 bg-white shadow-2xl overflow-hidden text-slate-900">
              <div className="h-7 flex items-center gap-2 px-3 border-b border-slate-200 bg-slate-100/90 select-none">
                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                <span className="w-3 h-3 rounded-full bg-green-400"></span>
                <span className="text-xs font-semibold text-slate-500 ml-2">trainingflow.app/training-plans</span>
              </div>
              <div className="p-5 bg-slate-50 space-y-4 text-left">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="text-lg font-black lowercase tracking-tighter text-slate-900">training plans</h3>
                    <p className="text-xs text-slate-500">periodization structures & templates</p>
                  </div>
                  <button className="px-3 py-1 rounded-xl bg-success text-white font-black text-xs flex items-center gap-1">
                    <Plus className="h-3.5 w-3.5" /> new plan
                  </button>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Card 1 */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-black lowercase text-slate-900">12-week half ironman plan</h4>
                      <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 text-[8px] font-black uppercase rounded">system</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">Comprehensive 70.3 distance periodization block with progressive volume.</p>
                    <div className="flex items-center justify-between border-t pt-2 text-[9px] font-extrabold text-slate-600">
                      <span>12 WEEKS</span>
                      <span>114 TOTAL HRS</span>
                      <span>9.5 HRS/WK</span>
                    </div>
                    <div className="h-6 flex items-end gap-1 border-t pt-1">
                      <div className="w-full bg-success/40 h-[40%] rounded-t" />
                      <div className="w-full bg-success/60 h-[60%] rounded-t" />
                      <div className="w-full bg-success/80 h-[80%] rounded-t" />
                      <div className="w-full bg-success h-[100%] rounded-t" />
                      <div className="w-full bg-success/70 h-[70%] rounded-t" />
                      <div className="w-full bg-success/40 h-[40%] rounded-t" />
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-black lowercase text-slate-900">8-week marathon taper & peak</h4>
                      <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 text-[8px] font-black uppercase rounded">system</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">High-volume marathon base building and automated 3-week taper.</p>
                    <div className="flex items-center justify-between border-t pt-2 text-[9px] font-extrabold text-slate-600">
                      <span>8 WEEKS</span>
                      <span>68 TOTAL HRS</span>
                      <span>8.5 HRS/WK</span>
                    </div>
                    <div className="h-6 flex items-end gap-1 border-t pt-1">
                      <div className="w-full bg-success/50 h-[50%] rounded-t" />
                      <div className="w-full bg-success/80 h-[80%] rounded-t" />
                      <div className="w-full bg-success h-[100%] rounded-t" />
                      <div className="w-full bg-success/80 h-[80%] rounded-t" />
                      <div className="w-full bg-success/50 h-[50%] rounded-t" />
                      <div className="w-full bg-success/30 h-[30%] rounded-t" />
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Feature 4: Workout Library */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <div className="lg:col-span-7 lg:order-1 order-2">
            <div className="rounded-2xl border border-slate-300/80 bg-white shadow-2xl overflow-hidden text-slate-900">
              <div className="h-7 flex items-center gap-2 px-3 border-b border-slate-200 bg-slate-100/90 select-none">
                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                <span className="w-3 h-3 rounded-full bg-green-400"></span>
                <span className="text-xs font-semibold text-slate-500 ml-2">trainingflow.app/library</span>
              </div>
              <div className="p-5 bg-slate-50 space-y-4 text-left">
                
                {/* Header & Search */}
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <h3 className="text-base font-black lowercase text-slate-900">workout library</h3>
                  </div>
                  <button className="px-3 py-1 rounded-xl bg-success text-white font-black text-xs flex items-center gap-1">
                    <Plus className="h-3.5 w-3.5" /> New Template
                  </button>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase">
                  <span className="px-2.5 py-1 bg-success text-white rounded-lg">ALL</span>
                  <span className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg">RUN</span>
                  <span className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg">BIKE</span>
                  <span className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg">SWIM</span>
                </div>

                {/* Workout Cards List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-[#EF4444] text-white p-3 rounded-xl shadow-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black lowercase truncate">5x1000m track intervals</span>
                      <Star className="w-3 h-3 fill-white text-white" />
                    </div>
                    <div className="text-[9px] font-bold opacity-90">45m · 8.2km · 5:29/km</div>
                  </div>

                  <div className="bg-[#FACC15] text-slate-950 p-3 rounded-xl shadow-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black lowercase truncate">3x20m sweetspot threshold</span>
                    </div>
                    <div className="text-[9px] font-bold opacity-80">1h 15m · 32.0km</div>
                  </div>

                  <div className="bg-[#3B82F6] text-white p-3 rounded-xl shadow-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black lowercase truncate">10x100m css speed sets</span>
                    </div>
                    <div className="text-[9px] font-bold opacity-90">1h 00m · 2,500m</div>
                  </div>

                  <div className="bg-[#22C55E] text-white p-3 rounded-xl shadow-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black lowercase truncate">core & lower body mobility</span>
                    </div>
                    <div className="text-[9px] font-bold opacity-90">45m</div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5 text-left lg:order-2 order-1">
            <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-black uppercase tracking-wider inline-block">
              Reusable Workout Library
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 dark:text-white">
              Build Once, Reuse Any Time
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed font-medium">
              Save your core interval sessions, long runs, and strength routines into a central library. Quickly drag templates directly onto any calendar day.
            </p>
            <ul className="space-y-3 pt-2">
              <li className="flex items-start gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                <span>Organized by sport type with custom category tagging.</span>
              </li>
              <li className="flex items-start gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                <span>Instant drag-and-drop scheduling onto the calendar grid.</span>
              </li>
              <li className="flex items-start gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                <span>Custom effort levels and target pace calculations.</span>
              </li>
            </ul>
          </div>

        </div>

      </section>

      {/* Secondary Features Grid */}
      <section className="py-20 bg-slate-100/50 dark:bg-slate-900/30 border-y border-slate-200/50 dark:border-slate-800/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Everything Else You Need</h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Purpose-built tools designed to streamline your daily training workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="group border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:shadow-xl hover:border-success/30 dark:hover:border-success/30 transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Watch className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Garmin CSV Import</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Import training logs directly from Garmin Connect CSV exports. Set custom activity mappings to align smartwatch data with your internal sports.
                </p>
              </CardContent>
            </Card>

            <Card className="group border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:shadow-xl hover:border-success/30 dark:hover:border-success/30 transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Periodized Goals</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Define weekly or monthly distance/duration targets. Track active completion rates via visual loading bars right on your calendar.
                </p>
              </CardContent>
            </Card>

            <Card className="group border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:shadow-xl hover:border-success/30 dark:hover:border-success/30 transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center group-hover:scale-110 transition-transform">
                  <LineChart className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Custom Sport Settings</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Customize pace units, distance units, and 4-tier effort level colors for every sport type to match your training philosophy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-success/20 blur-3xl rounded-full pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Ready to Elevate Your Training?</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base font-medium">
            Start structuring your workouts and building periodized plans today. Free for all endurance athletes.
          </p>
          <div>
            <Link 
              to={auth?.access_token ? "/dashboard" : "/auth/signup"} 
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-success text-white font-extrabold text-base hover:bg-success/90 shadow-lg shadow-success/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              Register for free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Deep Footer Navigation */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-800/50 pt-16 pb-12 transition-colors mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Main Footer Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Column 1: Brand & Pitch */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
                  Training<span className="text-success">Flow</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Structured calendar scheduling, rule-based taper periodization, and smartwatch imports for endurance athletes.
              </p>
              <div className="pt-2 flex items-center gap-2 text-2xs text-success font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-success" /> Athlete-First Platform
              </div>
            </div>

            {/* Column 2: Product Features */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">Features</h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <li><a href="#features" className="hover:text-success transition-colors">Drag & Drop Calendar</a></li>
                <li><a href="#features" className="hover:text-success transition-colors">Garmin CSV Sync</a></li>
                <li><a href="#features" className="hover:text-success transition-colors">Free Training Plans</a></li>
                <li><a href="#features" className="hover:text-success transition-colors">Workout Library</a></li>
                <li><a href="#features" className="hover:text-success transition-colors">Periodized Goals</a></li>
              </ul>
            </div>

            {/* Column 3: Account & Access */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">Account & Access</h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <li><Link to="/auth/signup" className="hover:text-success transition-colors">Register for free</Link></li>
                <li><Link to="/auth/signin" className="hover:text-success transition-colors">Sign In</Link></li>
                <li><Link to="/calendar" className="hover:text-success transition-colors">Training Calendar</Link></li>
              </ul>
            </div>

            {/* Column 4: Platform & Support */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">Platform</h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success"></span> Operational</li>
                <li><span className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer">Terms of Service</span></li>
                <li><span className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer">Garmin Mapping Docs</span></li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright Divider */}
          <div className="pt-8 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
            <p>© {new Date().getFullYear()} TrainingFlow. All rights reserved.</p>
            <p className="text-2xs text-slate-400">Engineered with React, Tailwind & Metronic UI</p>
          </div>

        </div>
      </footer>
    </div>
  );
}
