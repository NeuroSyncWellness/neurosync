"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, KeyRound, Lock, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase/client";

type ParentDetails = {
  firstName: string;
  lastName: string;
  countryCode: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  childLock: boolean;
  childLockPin: string;
};

type ParentTextField = "firstName" | "lastName";

const fields: Array<{ key: ParentTextField; label: string; placeholder: string; type?: string; icon?: typeof Mail }> = [
  { key: "firstName", label: "First name", placeholder: "Enter your first name" },
  { key: "lastName", label: "Last name", placeholder: "Enter your last name" },
];

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-up");
  const [form, setForm] = useState<ParentDetails>({ firstName: "", lastName: "", countryCode: "+91", phone: "", email: "", password: "", confirmPassword: "", childLock: true, childLockPin: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function finishAuthenticatedLogin(user: { id: string; email?: string | null; user_metadata: Record<string, unknown> }) {
    const metadata = user.user_metadata;
    const existingParent = localStorage.getItem("neurosync-parent-session");
    const existingChildLockPin = existingParent
      ? (JSON.parse(existingParent) as { childLockPin?: string }).childLockPin
      : undefined;
    localStorage.setItem("neurosync-parent-session", JSON.stringify({
      firstName: typeof metadata.firstName === "string" ? metadata.firstName : form.firstName.trim(),
      lastName: typeof metadata.lastName === "string" ? metadata.lastName : form.lastName.trim(),
      phone: typeof metadata.phone === "string" ? metadata.phone : `${form.countryCode}${form.phone.replace(/\D/g, "")}`,
      email: user.email ?? form.email.trim(),
      childLock: authMode === "sign-up" ? form.childLock : metadata.childLock === true,
      childLockPin: authMode === "sign-up" ? form.childLockPin : existingChildLockPin,
    }));
    localStorage.setItem("neurosync-child-lock", String(authMode === "sign-up" ? form.childLock : metadata.childLock === true));

    if (authMode === "sign-in") {
      const { data: children, error: childError } = await supabase
        .from("children")
        .select("name, date_of_birth, age")
        .eq("parent_id", user.id)
        .limit(1);

      if (childError) throw childError;
      const child = children?.[0];

      if (child) {
        localStorage.setItem("neurosync-child-session", JSON.stringify({
          name: child.name,
          dateOfBirth: child.date_of_birth,
          age: String(child.age),
        }));
        const childProfile = localStorage.getItem("neurosync-child-profile");
        const onboardingCompleted = childProfile
          ? (JSON.parse(childProfile) as { onboardingCompleted?: boolean }).onboardingCompleted === true
          : false;
        router.push(onboardingCompleted ? "/dashboard" : "/onboarding/diagnosis");
        return;
      }
    }

    localStorage.removeItem("neurosync-child-session");
    if (authMode === "sign-up") {
      localStorage.removeItem("neurosync-profile-answers");
      localStorage.setItem("neurosync-profile-complete", "false");
    }
    router.push("/login/child");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const identifier = form.email.trim();
    if (!identifier || !form.password) {
      setError("Enter your email and password.");
      return;
    }
    if (authMode === "sign-up" && [form.firstName, form.lastName, form.confirmPassword].some((value) => !value.trim())) {
      setError("Enter your first name, last name, and password details.");
      return;
    }
    if (authMode === "sign-up" && form.phone.replace(/\D/g, "").length < 7) {
      setError("Enter a valid contact number.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (authMode === "sign-up" && form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (authMode === "sign-up" && form.childLock && !/^\d{4}$/.test(form.childLockPin)) {
      setError("Enter a 4-digit child lock PIN.");
      return;
    }
    setLoading(true);
    try {
      const response = authMode === "sign-up"
        ? await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: {
              firstName: form.firstName.trim(),
              lastName: form.lastName.trim(),
              phone: `${form.countryCode}${form.phone.replace(/\D/g, "")}`,
              childLock: form.childLock,
            },
          },
        })
        : await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password });

      if (response.error) throw response.error;
      if (!response.data.user) throw new Error("Supabase did not return a user.");
      if (authMode === "sign-up" && !response.data.session) {
        throw new Error("Account created. Please disable email confirmation in Supabase, then create the account again to continue.");
      }

      await finishAuthenticatedLogin({
        id: response.data.user.id,
        email: response.data.user.email,
        user_metadata: response.data.user.user_metadata as Record<string, unknown>,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to authenticate with Supabase.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <header className="relative flex items-center justify-between gap-4">
          <Button variant="ghost" render={<Link href="/" />} nativeButton={false}><ArrowLeft /> Back to NeuroSync</Button>
          <Image src="/ns_logo_LIGHT.png" alt="NeuroSync" width={80} height={80} className="absolute left-1/2 size-12 -translate-x-1/2 rounded-lg object-contain mix-blend-multiply dark:hidden" priority />
          <Image src="/NeuroSync_logo.png" alt="NeuroSync" width={80} height={80} className="absolute left-1/2 hidden size-12 -translate-x-1/2 rounded-lg object-contain mix-blend-screen dark:block" priority />
          <Badge variant="secondary">Login</Badge>
        </header>

        <section className="mx-auto mt-12 max-w-2xl">
          <div className="mb-8 text-center">
            <Badge variant="secondary">WELCOME TO NEUROSYNC</Badge>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">{authMode === "sign-up" ? "Create your family account" : "Welcome back"}</h1>
            <p className="mt-3 text-muted-foreground">{authMode === "sign-up" ? "Create an account to set up your family space." : "Sign in to continue to your family space."}</p>
          </div>
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserRound className="size-5 text-primary" /> {authMode === "sign-up" ? "Parent details" : "Parent login"}</CardTitle>
              <p className="text-sm text-muted-foreground">{authMode === "sign-up" ? "Your details help personalize your space." : "Use your account email and password."}</p>
            </CardHeader>
            <CardContent className="bg-card">
              <form onSubmit={submit} className="space-y-5">
                {authMode === "sign-up" && <div className="grid gap-5 sm:grid-cols-2">
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
                          autoComplete={key === "firstName" ? "given-name" : "family-name"}
                        />
                      </div>
                    </div>
                  ))}
                </div>}
                {authMode === "sign-up" && <div className="space-y-2">
                  <Label htmlFor="parent-phone">Contact number</Label>
                  <div className="flex gap-2">
                    <select aria-label="Country code" value={form.countryCode} onChange={(event) => setForm({ ...form, countryCode: event.target.value })} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+61">+61</option>
                    </select>
                    <div className="relative flex-1">
                      <Phone className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <Input id="parent-phone" type="tel" inputMode="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value.replace(/[^\d\s-]/g, "") })} placeholder="Contact number" className="pl-9" autoComplete="tel" />
                    </div>
                  </div>
                </div>}
                <div className="grid gap-5 bg-muted/40 p-4 sm:grid-cols-2">
                  <div className={`space-y-2 ${authMode === "sign-in" ? "sm:col-span-2" : ""}`}>
                    <Label htmlFor="parent-email">Email address</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <Input
                        id="parent-email"
                        type="email"
                        inputMode="email"
                        value={form.email}
                        onChange={(event) => setForm({ ...form, email: event.target.value })}
                        placeholder="you@example.com"
                        className="pl-9"
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2"><Label htmlFor="parent-password">Password</Label><div className="relative"><KeyRound className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input id="parent-password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder={authMode === "sign-up" ? "Create a password" : "Enter your password"} className="pl-9" autoComplete={authMode === "sign-up" ? "new-password" : "current-password"} /></div></div>
                  {authMode === "sign-up" && <div className="space-y-2"><Label htmlFor="parent-confirm-password">Confirm password</Label><div className="relative"><KeyRound className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input id="parent-confirm-password" type="password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} placeholder="Re-enter the password" className="pl-9" autoComplete="new-password" /></div></div>}
                </div>
                {authMode === "sign-up" && <div className="rounded-2xl bg-muted/70 p-4">
                  <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-5 text-primary" /><div className="flex-1"><Label htmlFor="child-lock" className="text-sm font-semibold">Child lock</Label><p className="mt-1 text-xs leading-5 text-muted-foreground">Keep Parents/Guardian controls protected while a child uses the dashboard.</p></div><Checkbox id="child-lock" checked={form.childLock} onCheckedChange={(checked) => setForm({ ...form, childLock: checked === true })} className="mt-1" /></div>
                  {form.childLock && <div className="mt-4 space-y-2"><Label htmlFor="child-lock-pin">Child lock PIN</Label><div className="relative"><Lock className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input id="child-lock-pin" inputMode="numeric" maxLength={4} value={form.childLockPin} onChange={(event) => setForm({ ...form, childLockPin: event.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="Create a 4-digit PIN" className="pl-9" /></div></div>}
                </div>}
                {error && <p role="alert" className="rounded-xl bg-destructive/15 px-3 py-2 text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading ? "Connecting to Supabase…" : authMode === "sign-up" ? <>Create account <ArrowRight /></> : <>Sign in <ArrowRight /></>}</Button>
                <p className="text-center text-sm text-muted-foreground">
                  {authMode === "sign-up" ? "Already have an account?" : "New to NeuroSync?"}{" "}
                  <Button type="button" variant="link" className="h-auto p-0 font-medium" onClick={() => { setAuthMode(authMode === "sign-up" ? "sign-in" : "sign-up"); setError(""); }}>
                    {authMode === "sign-up" ? "Sign in" : "Create an account"}
                  </Button>
                </p>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
