"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ChildDetails = { name: string; dateOfBirth: string; age: string };

function calculateAge(dateOfBirth: string) {
  if (!dateOfBirth) return "";
  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  const today = new Date();
  if (Number.isNaN(birthDate.getTime()) || birthDate > today) return "";

  let age = today.getFullYear() - birthDate.getFullYear();
  const birthdayHasPassed =
    today.getMonth() > birthDate.getMonth()
    || (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  if (!birthdayHasPassed) age -= 1;
  return String(age);
}

export default function ChildLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<ChildDetails>({ name: "", dateOfBirth: "", age: "" });
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!form.name.trim() || !form.dateOfBirth || !form.age.trim()) {
      setError("Please complete the child details before continuing.");
      return;
    }
    const age = Number(form.age);
    if (!Number.isInteger(age) || age < 0 || age > 120) {
      setError("Enter a valid age.");
      return;
    }
    localStorage.setItem("neurosync-child-session", JSON.stringify(form));
    router.push("/dashboard");
  }

  return <main className="min-h-screen bg-muted/30 px-4 py-6 sm:px-6 sm:py-10"><div className="mx-auto max-w-3xl">
    <header className="flex items-center justify-between gap-4"><Button variant="ghost" asChild><Link href="/login"><ArrowLeft /> Back to login</Link></Button><Badge variant="secondary">Child details · 2 of 2</Badge></header>
    <section className="mx-auto mt-10 max-w-2xl text-center"><Badge className="border-primary/20 bg-primary/10 text-primary">FAMILY SETUP</Badge><h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Child details</h1><p className="mt-4 text-lg leading-8 text-muted-foreground">Add the child profile used to personalize the dashboard.</p></section>
    <Card className="mx-auto mt-8 max-w-2xl"><CardHeader><CardTitle className="flex items-center gap-2"><UserRound className="text-primary" /> Child information</CardTitle><CardDescription>These details help organize the child&apos;s family space.</CardDescription></CardHeader><CardContent><form onSubmit={submit} className="space-y-5"><div className="space-y-2"><Label htmlFor="child-name">Child name</Label><Input id="child-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Enter the child’s full name" autoComplete="name" /></div><div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="child-dob">Date of birth</Label><div className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input id="child-dob" type="date" max={new Date().toISOString().slice(0, 10)} value={form.dateOfBirth} onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value, age: calculateAge(event.target.value) })} className="pl-9" /></div></div><div className="space-y-2"><Label htmlFor="child-age">Age</Label><Input id="child-age" type="number" min="0" max="120" value={form.age} placeholder="Calculated from date of birth" readOnly className="bg-muted" /></div></div>{error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}<Button type="submit" className="w-full" size="lg">Login to dashboard <ArrowRight /></Button></form></CardContent></Card>
  </div></main>;
}
