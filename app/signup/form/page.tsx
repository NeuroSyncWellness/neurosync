"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Plan = { welcome: string; summary: string; palette: "sage" | "sand" | "lavender"; density: "comfortable" | "spacious"; textScale: "standard" | "large"; motion: "reduced" | "gentle"; modules: string[]; firstStep: string };
type FormState = { childName: string; supportFocus: string; sensoryLevel: string; communication: string; interfaceStyle: string };

const choices: Record<keyof Omit<FormState, "childName">, { question: string; options: [string, string][] }> = {
  supportFocus: { question: "What should the home screen support first?", options: [["focus", "Focus & learning"], ["calm", "Calm & regulation"], ["routines", "Routines & transitions"], ["communication", "Communication"]] },
  sensoryLevel: { question: "How much sensory stimulation feels comfortable?", options: [["low", "Low stimulation"], ["balanced", "Balanced"], ["engaging", "More engaging"]] },
  communication: { question: "Which guidance is most useful?", options: [["visual", "Visual support"], ["audio", "Audio support"], ["both", "A mix of both"]] },
  interfaceStyle: { question: "What style should the UI use?", options: [["simple", "Simple & quiet"], ["guided", "Step-by-step"], ["playful", "Warm & playful"]] },
};

export default function SignupForm() {
  const [form, setForm] = useState<FormState>({ childName: "", supportFocus: "focus", sensoryLevel: "balanced", communication: "both", interfaceStyle: "guided" });
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/ui-plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json() as { plan?: Plan; error?: string };
      if (!response.ok || !data.plan) throw new Error(data.error || "Unable to create your plan.");
      setPlan(data.plan);
      localStorage.setItem("neurosync-profile", JSON.stringify({ ...form, plan: data.plan }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create your plan.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="min-h-screen bg-muted/30 px-5 py-8 sm:px-8"><div className="mx-auto max-w-6xl">
    <header className="flex items-center justify-between"><Button variant="ghost" asChild><Link href="/"><ArrowLeft /> Back to NeuroSync</Link></Button><Badge variant="secondary">Personal setup · 2 minutes</Badge></header>
    <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_.8fr]">
      <section><Badge variant="warm">PERSONALIZE YOUR SPACE</Badge><h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">A UI that feels easier to use.</h1><p className="mt-4 max-w-xl text-lg leading-8 text-muted-foreground">Tell us a little about your preferred support style. We&apos;ll create a starting interface you can change at any time.</p>
        <Card className="mt-8"><CardHeader><CardTitle>Build a support profile</CardTitle><CardDescription>Your answers shape the first version of the dashboard.</CardDescription></CardHeader><CardContent><form onSubmit={generate} className="space-y-7"><div className="space-y-2"><Label htmlFor="child-name">Child&apos;s first name <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="child-name" value={form.childName} onChange={(event) => setForm({ ...form, childName: event.target.value })} maxLength={40} placeholder="For example, Aarav" /></div>
          {(Object.entries(choices) as Array<[keyof typeof choices, typeof choices[keyof typeof choices]]>).map(([field, choice]) => <fieldset key={field} className="space-y-3"><legend className="text-sm font-medium">{choice.question}</legend><div className="grid gap-2 sm:grid-cols-2">{choice.options.map(([value, label]) => <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition ${form[field] === value ? "border-primary bg-accent text-accent-foreground" : "border-input hover:bg-muted"}`}><input className="accent-[var(--primary)]" type="radio" name={field} value={value} checked={form[field] === value} onChange={() => setForm({ ...form, [field]: value })} />{label}</label>)}</div></fieldset>)}
          {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}<Button className="w-full" size="lg" disabled={loading}>{loading ? <><Loader2 className="animate-spin" /> Creating your UI…</> : <>Generate my UI <ArrowRight /></>}</Button>
        </form></CardContent></Card>
      </section>
      <Card className="h-fit border-primary/20 bg-primary/5"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><SlidersHorizontal className="size-5 text-primary" /> Your UI preview</CardTitle><CardDescription>See how your preferences become a calmer starting point.</CardDescription></CardHeader><CardContent>{plan ? <div className="space-y-5"><div className="rounded-lg border bg-card p-5"><p className="text-lg font-semibold">{plan.welcome}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{plan.summary}</p><div className="mt-5 space-y-2">{plan.modules.map((module) => <div key={module} className="flex items-center gap-2 rounded-md bg-muted p-3 text-sm font-medium"><Check className="size-4 text-primary" />{module}</div>)}</div></div><div className="rounded-lg border bg-card p-4 text-sm"><p className="font-semibold">First step</p><p className="mt-1 leading-6 text-muted-foreground">{plan.firstStep}</p><div className="mt-4 flex gap-2"><Badge variant="secondary">{plan.motion} motion</Badge><Badge variant="secondary">{plan.density} spacing</Badge></div></div><Button className="w-full" asChild><Link href="/login">Continue to parent login <ArrowRight /></Link></Button></div> : <div className="rounded-lg border border-dashed p-8 text-center"><SlidersHorizontal className="mx-auto size-8 text-muted-foreground" /><p className="mt-4 font-medium">Your personalized UI will appear here.</p><p className="mt-2 text-sm leading-6 text-muted-foreground">It will suggest a calm palette, layout density, and helpful home-screen modules.</p></div>}</CardContent></Card>
    </div>
  </div></main>;
}
