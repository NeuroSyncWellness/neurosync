import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Headphones, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const highlights = [
  ["Personalized support", "Create a space shaped around  your child’s needs.", Sparkles],
  ["Family-friendly tools", "Keep schedules, reminders, resources, and notes together.", ShieldCheck],
  ["A calmer experience", "Choose sensory controls that feel comfortable every day.", Headphones],
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <nav className="bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <Image src="/ns_logo_LIGHT.png" alt="NeuroSync" width={96} height={96} className="size-16 rounded-lg object-contain mix-blend-multiply dark:hidden" priority />
            <Image src="/NeuroSync_logo.png" alt="NeuroSync" width={96} height={96} className="hidden size-16 rounded-lg object-contain mix-blend-screen dark:block" priority />
          </Link>
          <Button variant="ghost" size="sm" render={<Link href="/login" />} nativeButton={false}>Sign in <ArrowRight data-icon="inline-end" /></Button>
        </div>
      </nav>

      <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <Badge variant="secondary">A calmer family support space</Badge>
          <h1 className="mt-6 text-5xl font-bold italic leading-[1.04] tracking-[-0.04em] sm:text-7xl">Support that starts with listening.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">NeuroSync brings routines, resources, and sensory-friendly tools together so every family can create more comfortable moments.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" render={<Link href="/login" />} nativeButton={false}>Create your family space <ArrowRight data-icon="inline-end" /></Button>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {["Personalized support", "Family-friendly tools", "Built for calmer moments"].map((item) => <span key={item} className="inline-flex items-center gap-2"><Check className="text-primary" data-icon="inline-start" />{item}</span>)}
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-16 grid max-w-6xl gap-4 md:grid-cols-3">
          {highlights.map(([title, description, Icon]) => <Card key={title as string} className="transition-transform hover:-translate-y-1"><CardHeader><div className="grid size-11 place-items-center rounded-2xl bg-secondary text-primary"><Icon /></div><CardTitle className="pt-2 text-base font-bold">{title as string}</CardTitle></CardHeader><CardContent><p className="leading-6 text-muted-foreground">{description as string}</p></CardContent></Card>)}
        </div>
      </section>
    </main>
  );
}
