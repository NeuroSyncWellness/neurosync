"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QuestionnairePlaceholder from "@/components/questionnaire-placeholder";
import { readChildProfile, saveChildProfile, type ChildProfile } from "@/lib/child-profile";

export default function QuestionnairePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ChildProfile | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("neurosync-parent-session") || !localStorage.getItem("neurosync-child-session")) {
      router.replace("/login");
      return;
    }
    const frame = requestAnimationFrame(() => {
      const stored = readChildProfile();
      if (!stored) {
        router.replace("/onboarding/diagnosis");
        return;
      }
      setProfile(stored);
    });
    return () => cancelAnimationFrame(frame);
  }, [router]);

  function completeOnboarding() {
    if (!profile) return;
    const completed = { ...profile, onboardingCompleted: true };
    saveChildProfile(completed);
    localStorage.setItem("neurosync-child-lock", "false");
    setProfile(completed);
    router.push("/dashboard");
  }

  if (!profile) return <main className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Loading questionnaire…</main>;
  return <main className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-10"><div className="mx-auto max-w-2xl"><div className="mb-8 text-center"><p className="text-sm font-semibold tracking-widest text-muted-foreground">Step 3 of 3</p><h1 className="mt-3 text-3xl font-bold tracking-tight">Let&apos;s personalize your child&apos;s space</h1></div><QuestionnairePlaceholder profile={profile} onContinue={completeOnboarding} /></div></main>;
}
