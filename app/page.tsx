import Link from "next/link";
import { ArrowRight, Headphones, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const highlights = [
  ["Personalized support", "Create a space shaped around your child’s needs.", Sparkles],
  ["Family-friendly tools", "Keep schedules, reminders, resources, and notes together.", ShieldCheck],
  ["A calmer experience", "Choose sensory controls that feel comfortable every day.", Headphones],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-muted/30">
      <nav className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="grid size-9 place-items-center rounded-lg bg-primary text-lg text-primary-foreground">n</span>
            <span className="text-xl">neurosync</span>
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary">A supportive family space</Badge>
          <h1 className="mt-5 text-5xl font-bold tracking-tighter sm:text-6xl">Support that starts with listening.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">NeuroSync helps families organize routines, discover helpful resources, and create calmer moments for every child.</p>
          <div className="mt-8 flex justify-center"><Button size="lg" asChild><Link href="/login">Login <ArrowRight /></Link></Button></div>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {highlights.map(([title, description, Icon]) => <Card key={title as string}><CardHeader><div className="grid size-11 place-items-center rounded-lg bg-secondary text-primary"><Icon className="size-5" /></div><CardTitle className="pt-3 text-lg">{title as string}</CardTitle></CardHeader><CardContent><p className="leading-7 text-muted-foreground">{description as string}</p></CardContent></Card>)}
        </div>
      </section>
    </main>
  );
}
