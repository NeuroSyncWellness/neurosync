"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, KeyRound, Lock, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ParentDetails = {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  childLock: boolean;
  childLockPin: string;
};

type ParentTextField = "firstName" | "middleName" | "lastName" | "email" | "phone";

const fields: Array<{ key: ParentTextField; label: string; placeholder: string; type?: string; icon?: typeof Mail }> = [
  { key: "firstName", label: "First name", placeholder: "Enter your first name" },
  { key: "middleName", label: "Middle name", placeholder: "Enter your middle name" },
  { key: "lastName", label: "Last name", placeholder: "Enter your last name" },
  { key: "email", label: "Email address", placeholder: "you@example.com", type: "email", icon: Mail },
  { key: "phone", label: "Phone number", placeholder: "+91 98765 43210", type: "tel", icon: Phone },
];

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<ParentDetails>({ firstName: "", middleName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "", childLock: true, childLockPin: "" });
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if ([form.firstName, form.middleName, form.lastName, form.email, form.phone, form.password, form.confirmPassword].some((value) => !value.trim())) {
      setError("Please complete all details before continuing.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.childLock && !/^\d{4}$/.test(form.childLockPin)) {
      setError("Enter a 4-digit child lock PIN.");
      return;
    }

    localStorage.setItem("neurosync-parent-session", JSON.stringify({
      firstName: form.firstName,
      middleName: form.middleName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      password: form.password,
      childLock: form.childLock,
      childLockPin: form.childLockPin,
    }));
    localStorage.setItem("neurosync-child-lock", String(form.childLock));
    localStorage.removeItem("neurosync-profile-answers");
    localStorage.setItem("neurosync-profile-complete", "false");
    router.push("/login/child");
  }

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4">
          <Button variant="ghost" asChild><Link href="/"><ArrowLeft /> Back to NeuroSync</Link></Button>
          <Badge variant="secondary">Login</Badge>
        </header>

        <div className="mt-8">
          <section className="mx-auto mb-8 max-w-3xl text-center">
            <Badge className="border-primary/20 bg-primary/10 text-primary">WELCOME TO NEUROSYNC</Badge>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Login</h1>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-muted-foreground">Enter Parents/Guardian details to continue to the dashboard.</p>
          </section>

          <Card className="mx-auto max-w-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserRound className="text-primary" /> Parents/Guardian information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  {fields.map(({ key, label, placeholder, type = "text", icon: Icon }) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={`parent-${key}`}>{label}</Label>
                      <div className="relative">
                        {Icon && <Icon className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />}
                        <Input
                          id={`parent-${key}`}
                          type={type}
                          value={form[key]}
                          onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                          placeholder={placeholder}
                          className={Icon ? "pl-9" : ""}
                          autoComplete={key === "email" ? "email" : key === "phone" ? "tel" : key === "firstName" ? "given-name" : key === "lastName" ? "family-name" : "additional-name"}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid gap-5 border-t pt-5 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="parent-password">Password</Label><div className="relative"><KeyRound className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input id="parent-password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Create a password" className="pl-9" autoComplete="new-password" /></div></div>
                  <div className="space-y-2"><Label htmlFor="parent-confirm-password">Confirm password</Label><div className="relative"><KeyRound className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input id="parent-confirm-password" type="password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} placeholder="Re-enter the password" className="pl-9" autoComplete="new-password" /></div></div>
                </div>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-5 text-primary" /><div className="flex-1"><Label htmlFor="child-lock" className="text-sm font-semibold">Child lock</Label><p className="mt-1 text-xs leading-5 text-muted-foreground">Keep Parents/Guardian controls protected while a child uses the dashboard.</p></div><input id="child-lock" type="checkbox" checked={form.childLock} onChange={(event) => setForm({ ...form, childLock: event.target.checked })} className="mt-1 size-4 accent-[var(--primary)]" /></div>
                  {form.childLock && <div className="mt-4 space-y-2"><Label htmlFor="child-lock-pin">Child lock PIN</Label><div className="relative"><Lock className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input id="child-lock-pin" inputMode="numeric" maxLength={4} value={form.childLockPin} onChange={(event) => setForm({ ...form, childLockPin: event.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="Create a 4-digit PIN" className="pl-9" /></div></div>}
                </div>
                {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" size="lg">Continue to child details <ArrowRight /></Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
