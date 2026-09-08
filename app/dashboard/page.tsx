"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  FileText,
  Lock,
  MessageCircle,
  Moon,
  Music2,
  Palette,
  Plus,
  Send,
  Settings,
  ShieldCheck,
  Smile,
  Sun,
  Unlock,
  Volume2,
  WandSparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

type Mode = "family" | "child";
type Profile = { childName?: string; plan?: { summary?: string; modules?: string[]; palette?: string } };
type ChildSession = { name?: string; dateOfBirth?: string; age?: string };
type ParentSession = { firstName?: string; middleName?: string; lastName?: string; email?: string; phone?: string; childLockPin?: string };

const schedules = [
  ["Now", "Focus reset", "6 min · auditory + movement"],
  ["4:30 PM", "Homework transition", "Visual checklist · 10 min"],
  ["7:15 PM", "Wind-down sounds", "Low stimulation · 12 min"],
];

const palettes = [
  ["sage", "Sage", "border border-primary/30 bg-primary/10 text-primary"],
  ["sand", "Sand", "border border-warm/30 bg-warm/10 text-warm"],
  ["lavender", "Lavender", "border border-secondary-foreground/20 bg-secondary text-secondary-foreground"],
];

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
  const [completed, setCompleted] = useState<string[]>([]);
  const [mood, setMood] = useState("");
  const [reminders, setReminders] = useState(["Occupational therapy · Tomorrow, 10:00 AM", "Evening medicine · Today, 8:00 PM"]);
  const [newReminder, setNewReminder] = useState("");
  const [diary, setDiary] = useState("");
  const [feedback, setFeedback] = useState("");
  const [chat, setChat] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [volume, setVolume] = useState(35);
  const [palette, setPalette] = useState("sage");
  const [authChecked, setAuthChecked] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);

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
    const useDark = storedTheme ? storedTheme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", useDark);
    const frame = requestAnimationFrame(() => {
      setDark(useDark);
      setLocked(localStorage.getItem("neurosync-child-lock") === "true");
      const storedProfile = localStorage.getItem("neurosync-profile");
      setProfileComplete(localStorage.getItem("neurosync-profile-complete") === "true");
      const storedParent = localStorage.getItem("neurosync-parent-session");
      if (storedParent) {
        try {
          setGuardian(JSON.parse(storedParent) as ParentSession);
        } catch {
          localStorage.removeItem("neurosync-parent-session");
        }
      }
      if (storedProfile) {
        try {
          const parsed = JSON.parse(storedProfile) as Profile;
          setProfile(parsed);
          if (parsed.plan?.palette) setPalette(parsed.plan.palette);
        } catch {
          localStorage.removeItem("neurosync-profile");
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

  const guardianName = [guardian.firstName, guardian.lastName].filter(Boolean).join(" ") || "Parents/Guardian";
  const childName = profile.childName || "your child";
  const progress = Math.min(100, 25 + completed.length * 25);
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("neurosync-theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  }
  function complete(item: string) {
    setCompleted((current) => current.includes(item) ? current : [...current, item]);
  }
  function toggleLock() {
    if (locked) {
      setUnlockPrompt(true);
      return;
    }
    setLocked(true);
    setMode("child");
    localStorage.setItem("neurosync-child-lock", "true");
  }
  function unlock() {
    if (pin !== (guardian.childLockPin || "1234")) return;
    setLocked(false);
    setMode("family");
    setUnlockPrompt(false);
    setPin("");
    localStorage.setItem("neurosync-child-lock", "false");
  }
  function addReminder() {
    if (!newReminder.trim()) return;
    setReminders((current) => [...current, newReminder.trim()]);
    setNewReminder("");
  }
  function sendChat() {
    if (!chat.trim()) return;
    setMessages((current) => [...current, `You: ${chat.trim()}`, "NeuroSync: Try one small, calm step and notice what helps."]);
    setChat("");
  }

  if (!authChecked) return <main className="grid min-h-screen place-items-center bg-muted/30 text-sm text-muted-foreground">Loading your family space…</main>;

  return (
    <main className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight"><span className="grid size-9 place-items-center rounded-lg bg-primary text-lg text-primary-foreground">n</span><span className="text-xl">neurosync</span></Link>
          <div className="flex items-center gap-2">
            <Button size="sm" variant={mode === "family" ? "default" : "secondary"} disabled={locked} onClick={() => setMode("family")}>Family mode</Button>
            <Button size="sm" variant={mode === "child" ? "warm" : "secondary"} onClick={() => setMode("child")}>Child mode</Button>
            <Button size="icon" variant="outline" onClick={toggleLock} aria-label="Toggle child lock">{locked ? <Lock /> : <Unlock />}</Button>
            <Button size="icon" variant="outline" onClick={toggleTheme} aria-label="Toggle theme">{dark ? <Sun /> : <Moon />}</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-xl border bg-card p-3 lg:sticky lg:top-24">
          <div className="mb-3 px-3 py-2"><p className="text-xs font-semibold tracking-widest text-muted-foreground">{mode === "family" ? "FAMILY MODE" : "CHILD MODE"}</p><p className="mt-1 font-semibold">{childName}&apos;s space</p></div>
          <nav className="grid grid-cols-2 gap-1 lg:grid-cols-1">
            {[["Schedule", CalendarDays, "schedule"], ["Resources", BookOpen, "resources"], ["Audio-visual library", Music2, "library"], ["Behavioural diary", FileText, "diary"], ["Feedback", Smile, "feedback"], ["AI chatbot", MessageCircle, "chat"], ["Settings", Settings, "settings"]].map(([label, Icon, panel]) => <Button key={label as string} variant={activePanel === panel ? "secondary" : "ghost"} className="justify-start text-left" onClick={() => setActivePanel(panel as string)}><Icon className="size-4" />{label as string}</Button>)}
          </nav>
        </aside>

        <div className="min-w-0 space-y-6">
          <section className="flex flex-wrap items-end justify-between gap-3"><div><Badge variant="warm">{mode === "family" ? "CAREGIVER DASHBOARD" : "CHILD SPACE"}</Badge><h1 className="mt-2 text-3xl font-bold tracking-tight">{mode === "family" ? `Good afternoon, ${guardianName}.` : `Hi ${childName}!`}</h1><p className="mt-1 text-muted-foreground">{mode === "family" ? `Everything you need for ${childName}, in one calm place.` : "Pick an activity and earn your next reward."}</p></div>{profile.plan && <Badge variant="secondary"><ShieldCheck className="mr-1 size-3" /> Personalized</Badge>}</section>

          {mode === "family" ? (
            <>
              <section className="grid gap-5 lg:grid-cols-[1.4fr_.6fr]">
                <Card className="border-primary bg-primary text-primary-foreground"><CardHeader><Badge className="w-fit border-white/20 bg-white/10 text-white">DAILY CHECK-IN</Badge><CardTitle className="mt-2 text-3xl">How is {childName} feeling?</CardTitle><CardDescription className="text-primary-foreground/75">A quick check-in helps you choose the right support.</CardDescription></CardHeader><CardContent><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{["Restless", "Low focus", "Overstimulated", "Feeling good"].map((item) => <Button key={item} variant={mood === item ? "warm" : "outline"} className={mood === item ? "" : "border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"} onClick={() => setMood(item)}>{item}</Button>)}</div>{mood && <p className="mt-4 text-sm text-warm">Check-in saved: {mood}.</p>}</CardContent></Card>
                <Card><CardHeader><Badge variant="secondary" className="w-fit">PERSONALIZATION</Badge><CardTitle className="mt-2">Your starting point</CardTitle><CardDescription>{profile.plan?.summary || "Complete the questionnaire to personalize this space."}</CardDescription></CardHeader><CardContent><Button variant="link" className="px-0" asChild><Link href="/signup/form">Update questionnaire <ChevronRight /></Link></Button></CardContent></Card>
              </section>
              <FamilyPanel activePanel={activePanel} schedules={schedules} reminders={reminders} newReminder={newReminder} setNewReminder={setNewReminder} addReminder={addReminder} diary={diary} setDiary={setDiary} feedback={feedback} setFeedback={setFeedback} chat={chat} setChat={setChat} messages={messages} sendChat={sendChat} complete={complete} completed={completed} />
            </>
          ) : (
            <ChildPanel childName={childName} progress={progress} completed={completed} complete={complete} schedules={schedules} />
          )}

          <SettingsPanel active={activePanel === "settings"} volume={volume} setVolume={setVolume} palette={palette} setPalette={setPalette} locked={locked} toggleLock={toggleLock} />
        </div>
      </div>

      {unlockPrompt && <div className="fixed inset-0 z-20 grid place-items-center bg-black/50 p-4"><Card className="w-full max-w-sm"><CardHeader><CardTitle className="flex items-center gap-2"><Lock className="text-warm" /> Parent unlock</CardTitle><CardDescription>Enter the child lock PIN saved for {guardianName}.</CardDescription></CardHeader><CardContent><Input value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" maxLength={4} placeholder="4-digit PIN" /><div className="mt-4 flex gap-2"><Button className="flex-1" variant="outline" onClick={() => setUnlockPrompt(false)}>Cancel</Button><Button className="flex-1" onClick={unlock}>Unlock</Button></div></CardContent></Card></div>}
      {!profileComplete && <div className="fixed inset-x-0 top-4 z-30 flex justify-center px-4"><Card className="w-full max-w-2xl border-primary/30 shadow-xl"><CardContent className="flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div className="flex items-center gap-3"><div className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><WandSparkles className="size-5" /></div><div><CardTitle className="text-base sm:text-lg">Complete your profile for personalised experience</CardTitle><CardDescription className="mt-1">Answer a few questions to personalise your family space.</CardDescription></div></div><Button className="w-full shrink-0 sm:w-auto" asChild><Link href="/profile">Go <ChevronRight /></Link></Button></CardContent></Card></div>}
    </main>
  );
}

function FamilyPanel(props: {
  activePanel: string;
  schedules: string[][];
  reminders: string[];
  newReminder: string;
  setNewReminder: (value: string) => void;
  addReminder: () => void;
  diary: string;
  setDiary: (value: string) => void;
  feedback: string;
  setFeedback: (value: string) => void;
  chat: string;
  setChat: (value: string) => void;
  messages: string[];
  sendChat: () => void;
  complete: (item: string) => void;
  completed: string[];
}) {
  const panel = props.activePanel || "schedule";
  if (panel === "resources") return <Card><CardHeader><CardTitle>Resources</CardTitle><CardDescription>Practical resources for family support.</CardDescription></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">{["Caregiver guides", "Routine visuals", "Calm-down ideas", "Communication tips"].map((item) => <Button key={item} variant="outline" className="h-auto justify-between p-4" onClick={() => props.complete(item)}>{item}<ChevronRight /></Button>)}</CardContent></Card>;
  if (panel === "library") return <Card><CardHeader><CardTitle>Audio-visual library</CardTitle><CardDescription>Choose a sound or visual support for this moment.</CardDescription></CardHeader><CardContent className="grid gap-3 sm:grid-cols-3">{["Calm sounds", "Focus cues", "Visual stories"].map((item) => <Button key={item} variant="secondary" className="h-auto flex-col p-5" onClick={() => props.complete(item)}><Music2 /><span className="mt-2">{item}</span></Button>)}</CardContent></Card>;
  if (panel === "diary") return <Card><CardHeader><CardTitle>Behavioural incident diary</CardTitle><CardDescription>Record context, possible triggers, interventions, and outcomes.</CardDescription></CardHeader><CardContent className="space-y-3"><Textarea value={props.diary} onChange={(event) => props.setDiary(event.target.value)} placeholder="What happened today?" /><Button onClick={() => props.setDiary("")}>Save diary entry <Check /></Button></CardContent></Card>;
  if (panel === "feedback") return <Card><CardHeader><CardTitle>Feedback</CardTitle><CardDescription>Help improve the support experience.</CardDescription></CardHeader><CardContent className="space-y-3"><div className="flex flex-wrap gap-2">{["Helpful", "Needs changes", "Not sure"].map((item) => <Button key={item} variant="outline" onClick={() => props.setFeedback(item)}>{item}</Button>)}</div>{props.feedback && <Badge variant="secondary">Saved: {props.feedback}</Badge>}</CardContent></Card>;
  if (panel === "chat") return <Card><CardHeader><CardTitle>AI chatbot</CardTitle><CardDescription>Ask for a practical, non-medical idea based on your notes.</CardDescription></CardHeader><CardContent><div className="mb-4 min-h-16 space-y-2 rounded-lg bg-muted p-3 text-sm">{props.messages.length ? props.messages.map((message) => <p key={message}>{message}</p>) : <p className="text-muted-foreground">Ask something like “How can we make homework transitions calmer?”</p>}</div><div className="flex gap-2"><Input value={props.chat} onChange={(event) => props.setChat(event.target.value)} onKeyDown={(event) => event.key === "Enter" && props.sendChat()} placeholder="Ask the chatbot..." /><Button size="icon" onClick={props.sendChat} aria-label="Send message"><Send /></Button></div></CardContent></Card>;
  return <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]"><Card><CardHeader><div className="flex items-center justify-between"><div><Badge variant="secondary">SCHEDULER</Badge><CardTitle className="mt-2">Today&apos;s schedule</CardTitle></div><Button size="icon" variant="secondary" aria-label="Add schedule item"><Plus /></Button></div></CardHeader><CardContent className="space-y-3">{props.schedules.map(([time, title, detail]) => <div key={title} className="flex items-center gap-3 rounded-lg bg-muted p-3"><span className="w-14 text-xs font-semibold text-muted-foreground">{time}</span><div className="grid size-9 place-items-center rounded-md bg-secondary text-primary"><Volume2 className="size-4" /></div><div className="min-w-0 flex-1"><p className="font-medium">{title}</p><p className="text-xs text-muted-foreground">{detail}</p></div><Button size="sm" variant="outline" onClick={() => props.complete(title)}>{props.completed.includes(title) ? <Check /> : "Done"}</Button></div>)}</CardContent></Card><Card><CardHeader><Badge variant="secondary" className="w-fit">MEDICAL REMINDERS</Badge><CardTitle className="mt-2">Reminder list</CardTitle></CardHeader><CardContent className="space-y-3">{props.reminders.map((reminder) => <div key={reminder} className="rounded-lg bg-muted p-3 text-sm">{reminder}</div>)}<div className="flex gap-2"><Input value={props.newReminder} onChange={(event) => props.setNewReminder(event.target.value)} placeholder="Add reminder" /><Button size="icon" onClick={props.addReminder} aria-label="Add reminder"><Plus /></Button></div></CardContent></Card></div>;
}

function ChildPanel({ childName, progress, completed, complete, schedules }: { childName: string; progress: number; completed: string[]; complete: (item: string) => void; schedules: string[][] }) {
  return <div className="space-y-5"><Card className="border-warm bg-warm text-warm-foreground"><CardHeader><Badge className="w-fit border-white/20 bg-white/10 text-white">REWARDS</Badge><CardTitle className="text-3xl">Great work, {childName}!</CardTitle><CardDescription className="text-white/80">Complete tasks to unlock your next reward.</CardDescription></CardHeader><CardContent><Progress value={progress} className="bg-white/20 [&>div]:bg-white" /><p className="mt-2 text-sm">{progress}% of today&apos;s path complete</p></CardContent></Card><div className="grid gap-5 md:grid-cols-2"><Card><CardHeader><CardTitle>Gamified skill development</CardTitle><CardDescription>Choose a skill to practice.</CardDescription></CardHeader><CardContent className="grid gap-2">{["Focus skill", "Calm breathing", "Communication skill"].map((item) => <Button key={item} variant={completed.includes(item) ? "secondary" : "outline"} className="justify-between" onClick={() => complete(item)}>{item}{completed.includes(item) ? <Check /> : <WandSparkles />}</Button>)}</CardContent></Card><Card><CardHeader><CardTitle>AAC communication</CardTitle><CardDescription>Tap a phrase to communicate.</CardDescription></CardHeader><CardContent className="grid grid-cols-2 gap-2">{["I need a break", "I feel good", "Help please", "I am ready"].map((phrase) => <Button key={phrase} variant="secondary" className="h-auto min-h-14 whitespace-normal" onClick={() => complete(phrase)}>{phrase}</Button>)}</CardContent></Card></div><div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><Card><CardHeader><CardTitle>Activities journal</CardTitle><CardDescription>Pick an activity based on your interests.</CardDescription></CardHeader><CardContent className="grid gap-2 sm:grid-cols-3">{["Music", "Drawing", "Movement"].map((item) => <Button key={item} variant="outline" onClick={() => complete(item)}><Palette />{item}</Button>)}</CardContent></Card><Card><CardHeader><CardTitle>My scheduler</CardTitle><CardDescription>What comes next?</CardDescription></CardHeader><CardContent className="space-y-2">{schedules.map(([time, title]) => <button key={title} onClick={() => complete(title)} className="flex w-full items-center gap-3 rounded-lg bg-muted p-3 text-left text-sm"><CalendarDays className="size-4 text-primary" /><span className="flex-1">{time} · {title}</span><ChevronRight className="size-4" /></button>)}</CardContent></Card></div></div>;
}

function SettingsPanel({ active, volume, setVolume, palette, setPalette, locked, toggleLock }: { active: boolean; volume: number; setVolume: (value: number) => void; palette: string; setPalette: (value: string) => void; locked: boolean; toggleLock: () => void }) {
  return <Card id="settings" className={active ? "ring-2 ring-primary" : ""}><CardHeader><CardTitle className="flex items-center gap-2"><Settings className="size-5 text-primary" /> Settings</CardTitle><CardDescription>Adjust sensory controls, themes, and child lock.</CardDescription></CardHeader><CardContent className="grid gap-6 md:grid-cols-3"><div className="space-y-2"><Label htmlFor="volume"><Volume2 className="mr-2 inline size-4" />Sensory volume · {volume}%</Label><input id="volume" type="range" min="0" max="100" value={volume} onChange={(event) => setVolume(Number(event.target.value))} className="w-full accent-(--primary)" /></div><div className="space-y-2"><Label><Palette className="mr-2 inline size-4" />Theme selector</Label><div className="flex flex-wrap gap-2">{palettes.map(([value, label, className]) => <button key={value} onClick={() => setPalette(value)} className={`rounded-md px-3 py-2 text-xs font-medium ${className} ${palette === value ? "ring-2 ring-primary ring-offset-2" : ""}`}>{label}</button>)}</div></div><Button variant="outline" className="h-auto justify-start py-4" onClick={toggleLock}>{locked ? <Lock /> : <Unlock />}<span>{locked ? "Child lock is on" : "Child lock is off"}<span className="block text-xs text-muted-foreground">Parent-controlled access</span></span></Button></CardContent></Card>;
}
