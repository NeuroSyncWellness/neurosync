"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Bell,
  CalendarDays,
  CalendarClock,
  ChevronRight,
  FileText,
  Lock,
  MessageCircle,
  Moon,
  Music2,
  Settings,
  Sun,
  Unlock,
  UserCircle,
  WandSparkles,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  applyChildTheme,
  applyFamilyTheme,
  CHILD_ACTIVE_THEME_STORAGE_KEY,
  readChildProfile,
  saveChildProfile,
  type ChildTheme,
} from "@/lib/child-profile";

type Mode = "family" | "child";
type Profile = { childName?: string };
type ChildSession = { name?: string; dateOfBirth?: string; age?: string };
type ParentSession = { firstName?: string; middleName?: string; lastName?: string; email?: string; phone?: string; childLockPin?: string };

export default function Dashboard() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("family");
  const [dark, setDark] = useState(false);
  const [locked, setLocked] = useState(false);
  const [pin, setPin] = useState("");
  const [unlockPrompt, setUnlockPrompt] = useState(false);
  const [profile, setProfile] = useState<Profile>({});
  const [guardian, setGuardian] = useState<ParentSession>({});
  const [activePanel, setActivePanel] = useState("");
  const [mood, setMood] = useState("");
  const reminders = ["Occupational therapy · Tomorrow, 10:00 AM", "Evening medicine · Today, 8:00 PM"];
  const [authChecked, setAuthChecked] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [profilePromptDismissed, setProfilePromptDismissed] = useState(false);
  const [actionNotice, setActionNotice] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [childTheme, setChildTheme] = useState<ChildTheme>("universal");
  const notifications = [
    { title: "Profile questions", message: profileComplete ? "All profile questions are complete." : "You have unanswered profile questions. Open your questionnaire to continue.", icon: WandSparkles },
    { title: "Today’s reminder", message: reminders[0] || "No reminders scheduled today.", icon: CalendarDays },
    { title: "NeuroSync note", message: "Small, calm steps count. You’re doing meaningful work.", icon: MessageCircle },
  ];

  useEffect(() => {
    let parentSession = false;
    let childSession = false;
    let storedTheme: string | null = null;
    try {
      parentSession = Boolean(localStorage.getItem("neurosync-parent-session"));
      childSession = Boolean(localStorage.getItem("neurosync-child-session"));
      storedTheme = localStorage.getItem("neurosync-theme");
    } catch {
      router.replace("/login");
      return;
    }
    if (!parentSession) {
      router.replace("/login");
      return;
    }
    if (!childSession) {
      router.replace("/login/child");
      return;
    }
    const childProfile = readChildProfile();
    if (!childProfile?.onboardingCompleted) {
      router.replace("/onboarding/diagnosis");
      return;
    }
    const useDark = storedTheme ? storedTheme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", useDark);
    const frame = requestAnimationFrame(() => {
      setDark(useDark);
      setLocked(localStorage.getItem("neurosync-child-lock") === "true");
      setProfileComplete(localStorage.getItem("neurosync-profile-complete") === "true");
      if (childProfile) {
        const storedActiveTheme = localStorage.getItem(CHILD_ACTIVE_THEME_STORAGE_KEY) as ChildTheme | null;
        const activeTheme = storedActiveTheme || childProfile.activeTheme;
        setChildTheme(activeTheme);
        if (localStorage.getItem("neurosync-child-lock") === "true") {
          setMode("child");
          applyChildTheme(activeTheme, useDark);
        }
      }
      const storedParent = localStorage.getItem("neurosync-parent-session");
      if (storedParent) {
        try {
          setGuardian(JSON.parse(storedParent) as ParentSession);
        } catch {
          localStorage.removeItem("neurosync-parent-session");
        }
      }
      const storedChild = localStorage.getItem("neurosync-child-session");
      if (storedChild) {
        try {
          const child = JSON.parse(storedChild) as ChildSession;
          if (child.name) setProfile((current) => ({ ...current, childName: child.name }));
        } catch {
          localStorage.removeItem("neurosync-child-session");
        }
      }
      setAuthChecked(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [router]);

  useEffect(() => {
    if (!actionNotice) return;
    const timeout = window.setTimeout(() => setActionNotice(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [actionNotice]);

  const guardianName = [guardian.firstName, guardian.lastName].filter(Boolean).join(" ") || "Parents/Guardian";
  const childName = profile.childName || "your child";
  const progress = 25;
  
  function toggleTheme() {
    const next = !dark;

    setDark(next);

    localStorage.setItem(
      "neurosync-theme",
      next ? "dark" : "light"
    );

    document.documentElement.classList.toggle("dark", next);
    if (mode === "child") {
      applyChildTheme(childTheme, next);
    } else {
      applyFamilyTheme(next, localStorage.getItem("neurosync-palette") || "purple");
    }
  }
  function toggleLock() {
    if (locked) {
      setUnlockPrompt(true);
      return;
    }
    setLocked(true);
    setMode("child");
    applyChildTheme(childTheme, dark);
    localStorage.setItem("neurosync-child-lock", "true");
  }
  function activateChildMode() {
    setMode("child");
    setLocked(true);
    applyChildTheme(childTheme, dark);
    localStorage.setItem("neurosync-child-lock", "true");
    setActionNotice("Child mode is active and locked.");
  }
  function unlock() {
    if (pin !== (guardian.childLockPin || "1234")) return;
    setLocked(false);
    setMode("family");
    applyFamilyTheme(dark, localStorage.getItem("neurosync-palette") || "purple");
    setUnlockPrompt(false);
    setPin("");
    localStorage.setItem("neurosync-child-lock", "false");
  }
  function changeChildTheme(theme: ChildTheme) {
    setChildTheme(theme);
    const profile = readChildProfile();
    if (profile) saveChildProfile({ ...profile, activeTheme: theme });
    if (mode === "child") applyChildTheme(theme, dark);
    setActionNotice(`Child theme changed to ${theme.replace("_", " + ").toUpperCase()}.`);
  }
  if (!authChecked) return <main className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Loading your family space…</main>;

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight"><Image src="/ns_logo_LIGHT.png" alt="NeuroSync" width={80} height={80} className="size-12 rounded-lg object-contain mix-blend-multiply dark:hidden" priority /><Image src="/NeuroSync_logo.png" alt="NeuroSync" width={80} height={80} className="hidden size-12 rounded-lg object-contain mix-blend-screen dark:block" priority /></Link>
          <div className="flex items-center gap-2">
            <Button size="sm" variant={mode === "family" ? "default" : "secondary"} disabled={locked || mode === "child"} onClick={() => { setMode("family"); setActionNotice("Family mode is active."); }}>Family mode</Button>
            <Button size="sm" variant="secondary" disabled={mode === "child"} className={mode === "child" ? "bg-warm text-warm-foreground hover:bg-warm/90" : ""} onClick={activateChildMode}>Child mode</Button>
            <div className="relative">
              <Button size="icon" variant={notificationsOpen ? "default" : "outline"} disabled={mode === "child"} aria-label="Open notifications" onClick={() => setNotificationsOpen((current) => !current)}><Bell /></Button>
              <span className="pointer-events-none absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-warm text-[10px] font-bold text-warm-foreground">{notifications.length}</span>
              {notificationsOpen && <Card className="absolute right-0 top-12 z-30 w-[min(22rem,calc(100vw-2rem))] shadow-xl">
                <CardHeader className="pb-3"><div className="flex items-start justify-between gap-3"><div><CardTitle className="text-base">Notifications</CardTitle><CardDescription className="mt-1">Helpful messages for your family space.</CardDescription></div><div className="flex items-center gap-2"><Badge variant="secondary">{notifications.length} updates</Badge><Button size="icon" variant="ghost" className="size-7" aria-label="Close notifications" onClick={() => setNotificationsOpen(false)}><X /></Button></div></div></CardHeader>
                <CardContent className="grid gap-2">
                  {notifications.map(({ title, message, icon: Icon }) => <button key={title} type="button" className="flex w-full gap-3 rounded-xl bg-muted p-3 text-left transition-colors hover:bg-muted/80" onClick={() => { if (title === "Profile questions" && !profileComplete) router.push("/profile"); setNotificationsOpen(false); setActionNotice(`${title} opened.`); }}><Icon className="mt-0.5 size-4 shrink-0 text-primary" /><span><span className="block text-sm font-semibold">{title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{message}</span></span></button>)}
                </CardContent>
              </Card>}
            </div>
            <Button size="icon" variant="outline" onClick={() => { toggleLock(); setActionNotice(locked ? "Enter your PIN to unlock family mode." : "Child lock enabled."); }} aria-label="Toggle child lock">{locked ? <Lock /> : <Unlock />}</Button>
            <Button size="icon" variant="outline" disabled={mode === "child"} onClick={() => { toggleTheme(); setActionNotice("Theme updated."); }} aria-label="Toggle theme">{dark ? <Sun /> : <Moon />}</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[320px_1fr]">
        <aside className="h-fit rounded-2xl bg-menu-surface p-3 shadow-sm lg:sticky lg:top-24">
          <div className="mb-3 px-3 py-2">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground">
              {mode === "family" ? "FAMILY MODE" : "CHILD MODE"}
            </p>
            <p className="mt-1 font-semibold">{childName}&apos;s space</p>
          </div>
          <nav className="grid grid-cols-2 gap-1 lg:grid-cols-1">
            {(mode === "child"
              ? [
                ["Basic & Daily 3-D Push to Talk Communication", MessageCircle, "chat"],
                ["Gamified Neuro-Routine & Scheduling", CalendarDays, "schedule"],
                ["Puzzles", WandSparkles, "puzzles"],
              ]
              : [
                ["Adaptive Sensory Audio Library", Music2, "library"],
                ["AI Chatbot", MessageCircle, "chat"],
                ["Neuro-Routine & Scheduling", CalendarDays, "schedule"],
                ["Parent Journal", FileText, "diary"],
                ["Resources", BookOpen, "resources"],
                ["Therapy Schedule", CalendarClock, "therapy"],
                ["Profile", UserCircle, "profile"],
                ["Settings", Settings, "settings"],
              ]
            ).map(([label, Icon, panel]) => (
              <Button
                key={label as string}
                variant={activePanel === panel ? "secondary" : "ghost"}
                className="h-auto min-h-10 justify-start whitespace-normal text-left leading-5"
                disabled={mode === "child"}
                onClick={() => {
                  if (panel === "settings") {
                    router.push("/dashboard/settings");
                    return;
                  }
                  if (panel === "profile") {
                    router.push("/dashboard/profile");
                    return;
                  }
                  setActivePanel(panel as string);
                  setActionNotice("In Progress");
                }}
              >
                <Icon className="size-4" />
                {label as string}
              </Button>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 space-y-6">
          <section className="flex flex-wrap items-end justify-between gap-3"><div><Badge variant="secondary">{mode === "family" ? "CAREGIVER DASHBOARD" : "CHILD SPACE"}</Badge><h1 className="mt-2 text-3xl font-bold italic tracking-tight">{mode === "family" ? `Good afternoon, ${guardianName}.` : `Hi ${childName}!`}</h1><p className="mt-1 text-muted-foreground">{mode === "family" ? `Everything you need for ${childName}, in one calm place.` : "Pick an activity and earn your next reward."}</p></div></section>

          {mode === "family" ? (
            <section>
              <Card className="bg-checkin-surface"><CardHeader><Badge variant="secondary" className="w-fit">DAILY CHECK-IN</Badge><CardTitle className="mt-2 text-2xl">How is {childName} feeling?</CardTitle><CardDescription>A quick check-in helps you choose the right support.</CardDescription></CardHeader><CardContent><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{["Restless", "Low focus", "Overstimulated", "Feeling good"].map((item) => <Button key={item} variant={mood === item ? "default" : "outline"} onClick={() => setMood(item)}>{item}</Button>)}</div>{mood && <p className="mt-4 text-sm text-muted-foreground">Check-in saved: {mood}.</p>}</CardContent></Card>
              <Card className="mt-6"><CardHeader><CardTitle className="text-lg">Child Mode theme</CardTitle><CardDescription>Your recommended theme is the starting point. You can change the active theme without changing the profile.</CardDescription></CardHeader><CardContent><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{(["universal", "ocd", "adhd", "asd", "ocd_adhd", "ocd_asd", "adhd_asd"] as ChildTheme[]).map((theme) => <Button key={theme} variant={childTheme === theme ? "default" : "outline"} onClick={() => changeChildTheme(theme)}>{theme.replace("_", " + ").toUpperCase()}</Button>)}</div></CardContent></Card>
            </section>
          ) : (
            <ChildPanel childName={childName} progress={progress} />
          )}

        </div>
      </div>

      {unlockPrompt && <div className="fixed inset-0 z-20 grid place-items-center bg-black/50 p-4"><Card className="w-full max-w-sm"><CardHeader><CardTitle className="flex items-center gap-2"><Lock className="text-warm" /> Parent unlock</CardTitle><CardDescription>Enter the child lock PIN saved for {guardianName}.</CardDescription></CardHeader><CardContent><Input value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" maxLength={4} placeholder="4-digit PIN" /><div className="mt-4 flex gap-2"><Button className="flex-1" variant="outline" onClick={() => setUnlockPrompt(false)}>Cancel</Button><Button className="flex-1" onClick={unlock}>Unlock</Button></div></CardContent></Card></div>}
      {!profileComplete && !profilePromptDismissed && <div className="pointer-events-none fixed right-4 top-20 z-30 w-[min(24rem,calc(100vw-2rem))]"><Card className="pointer-events-auto shadow-xl"><CardContent className="flex flex-col items-start gap-4 p-4"><div className="flex w-full items-start gap-3"><WandSparkles className="mt-0.5 size-5 shrink-0 text-primary" /><div className="min-w-0 flex-1"><CardTitle className="text-base">Complete your profile</CardTitle><CardDescription className="mt-1">Answer a few questions to personalise your family space.</CardDescription></div><Button type="button" variant="ghost" size="icon" className="size-7 shrink-0" aria-label="Dismiss profile reminder" onClick={() => setProfilePromptDismissed(true)}><X /></Button></div><Button className="w-full" render={<Link href="/profile" />} nativeButton={false}>Go to profile <ChevronRight /></Button></CardContent></Card></div>}
      {actionNotice && <div className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg" role="status">{actionNotice}<Button size="icon" variant="ghost" className="ml-2 size-6 text-primary-foreground hover:bg-primary-foreground/10" aria-label="Dismiss message" onClick={() => setActionNotice("")}><X /></Button></div>}
    </main>
  );
}

function ChildPanel({ childName, progress }: { childName: string; progress: number }) {
  return <div><Card className="bg-warm text-warm-foreground"><CardHeader><Badge className="w-fit bg-white/10 text-white">REWARDS</Badge><CardTitle className="text-3xl font-bold italic">Great work, {childName}!</CardTitle><CardDescription className="text-white/80">Complete tasks to unlock your next reward.</CardDescription></CardHeader><CardContent><Progress value={progress} className="bg-white/20 [&>div]:bg-white" /><p className="mt-2 text-sm">{progress}% of today&apos;s path complete</p></CardContent></Card></div>;
}
