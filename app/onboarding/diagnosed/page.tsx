"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { saveChildProfile, getChildTheme, type DisorderId, type Severity } from "@/lib/child-profile";

const disorders: Array<{ id: DisorderId; description: string }> = [
  { id: "ocd", description: "A calm profile for OCD-focused support." },
  { id: "adhd", description: "A focused profile for ADHD-focused support." },
  { id: "asd", description: "A sensory-aware profile for ASD-focused support." },
];
const severityLabels = ["Mild", "Low", "Medium", "High", "Severe"];
const sizes = ["size-4", "size-5", "size-6", "size-7", "size-8"];

export default function DiagnosedPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<DisorderId[]>([]);
  const [severity, setSeverity] = useState<Partial<Record<DisorderId, Severity>>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("neurosync-parent-session") || !localStorage.getItem("neurosync-child-session")) {
      router.replace("/login");
      return;
    }
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, [router]);

  function toggleDisorder(id: DisorderId) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    setSeverity((current) => {
      if (selected.includes(id)) {
        const next = { ...current };
        delete next[id];
        return next;
      }
      return current;
    });
  }

  const complete = selected.length > 0 && selected.every((id) => severity[id]);
  function continueFlow() {
    if (!complete) return;
    const profileDisorders = selected.map((id) => ({ id, severity: severity[id] as Severity }));
    const theme = getChildTheme("diagnosed", profileDisorders);
    saveChildProfile({ diagnosisStatus: "diagnosed", disorders: profileDisorders, recommendedTheme: theme, activeTheme: theme, onboardingCompleted: false });
    router.push("/onboarding/questionnaire");
  }

  if (!ready) return <main className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Loading onboarding…</main>;

  return <main className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-10"><div className="mx-auto max-w-4xl"><header className="flex items-center justify-between gap-4"><Badge variant="secondary">Step 2 of 3</Badge><Badge variant="outline">Diagnosed</Badge></header><section className="mt-12 text-center"><Badge variant="secondary">CONDITIONS</Badge><h1 className="mt-4 text-3xl font-bold tracking-tight">Which conditions has your child been diagnosed with?</h1><p className="mx-auto mt-3 max-w-xl text-muted-foreground">Select one or more conditions. Each selected condition needs a severity level.</p></section><div className="mt-8 grid gap-4 md:grid-cols-3">{disorders.map(({ id, description }) => { const isSelected = selected.includes(id); return <Card key={id} className={`transition-all ${isSelected ? "bg-primary/15 ring-2 ring-primary" : ""}`}><button type="button" aria-pressed={isSelected} onClick={() => toggleDisorder(id)} className="w-full text-left"><CardHeader><CardTitle className="flex items-center justify-between gap-3">{id.toUpperCase()}{isSelected ? <Check className="text-primary" /> : <Circle className="text-muted-foreground" />}</CardTitle><CardDescription>{description}</CardDescription></CardHeader></button>{isSelected && <CardContent><fieldset><legend className="text-sm font-semibold">Severity</legend><div className="mt-3 flex items-end justify-between gap-2">{([1, 2, 3, 4, 5] as Severity[]).map((level, index) => <button key={level} type="button" aria-label={`${level} — ${severityLabels[index]}`} aria-pressed={severity[id] === level} onClick={() => setSeverity((current) => ({ ...current, [id]: level }))} className="flex flex-col items-center gap-2 text-xs font-medium"><span className={`${sizes[index]} rounded-full border-2 transition-all ${severity[id] === level ? "border-primary bg-primary ring-4 ring-primary/20" : "border-muted-foreground/60 bg-muted hover:border-primary"}`} />{level}<span className="text-[10px] text-muted-foreground">{severityLabels[index]}</span></button>)}</div></fieldset></CardContent>}</Card>; })}</div><Button className="mt-8 w-full" size="lg" disabled={!complete} onClick={continueFlow}>Continue to questionnaire <ArrowRight data-icon="inline-end" /></Button></div></main>;
}
