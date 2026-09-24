"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Loader2, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";

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
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
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

    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        setError("Your session has expired. Please sign in again.");
        router.replace("/login");
        return;
      }

      const { error: insertError } = await supabase.from("children").insert({
        parent_id: user.id,
        name: form.name.trim(),
        date_of_birth: form.dateOfBirth,
        age,
      });
      if (insertError) throw insertError;

      localStorage.setItem("neurosync-child-session", JSON.stringify(form));
      router.push("/onboarding/diagnosis");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save the child profile.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between gap-4">
          <Button variant="ghost" render={<Link href="/login" />} nativeButton={false}><ArrowLeft /> Back to login</Button>
          <Image src="/ns_logo_LIGHT.png" alt="NeuroSync" width={80} height={80} className="size-12 rounded-lg object-contain mix-blend-multiply dark:hidden" priority />
          <Image src="/NeuroSync_logo.png" alt="NeuroSync" width={80} height={80} className="hidden size-12 rounded-lg object-contain mix-blend-screen dark:block" priority />
          <Badge variant="secondary">Step 2 of 2</Badge>
        </header>
        <div className="mx-auto mt-12 max-w-xl">
          <section className="text-center">
            <Badge variant="secondary">FAMILY SETUP</Badge>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">Tell us about your child</h1>
            <p className="mx-auto mt-3 text-muted-foreground">These details help personalize the dashboard.</p>
          </section>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserRound className="size-5 text-primary" /> Child profile</CardTitle>
              <CardDescription>This information is securely associated with your parent account.</CardDescription>
            </CardHeader>
            <CardContent className="bg-card">
              <form onSubmit={submit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="child-name">Child name</Label>
                  <Input id="child-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Enter the child’s full name" autoComplete="name" />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="child-dob">Date of birth</Label>
                    <div className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input id="child-dob" type="date" max={new Date().toISOString().slice(0, 10)} value={form.dateOfBirth} onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value, age: calculateAge(event.target.value) })} className="pl-9" /></div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="child-age">Age</Label>
                    <Input id="child-age" type="number" min="0" max="120" value={form.age} placeholder="Calculated automatically" readOnly className="bg-muted" />
                  </div>
                </div>
                {error && <p role="alert" className="rounded-xl bg-destructive/15 px-3 py-2 text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading ? <><Loader2 className="animate-spin" /> Saving child profile…</> : <>Continue to dashboard <ArrowRight /></>}</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
