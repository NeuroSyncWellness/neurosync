"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CHILD_PROFILE_STORAGE_KEY, saveChildProfile, type DiagnosisStatus } from "@/lib/child-profile";

export default function DiagnosisStatusPage() {
  const router = useRouter();
  const [status, setStatus] = useState<DiagnosisStatus | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("neurosync-parent-session") || !localStorage.getItem("neurosync-child-session")) {
      router.replace("/login");
      return;
    }
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, [router]);

  function selectStatus(nextStatus: DiagnosisStatus) {
    setStatus(nextStatus);
    if (nextStatus === "undiagnosed") {
      saveChildProfile({
        diagnosisStatus: nextStatus,
        disorders: [],
        recommendedTheme: "universal",
        activeTheme: "universal",
        onboardingCompleted: false,
      });
      router.push("/onboarding/questionnaire");
      return;
    }
    localStorage.removeItem(CHILD_PROFILE_STORAGE_KEY);
    router.push("/onboarding/diagnosed");
  }

  if (!ready) return <main className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Loading onboarding…</main>;

  return (
    <OnboardingShell step="Step 1 of 3">
      <section className="text-center">
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Is your child diagnosed with any of the following conditions?</h1>
      </section>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {([
          ["diagnosed", "Diagnosed"],
          ["undiagnosed", "Undiagnosed"],
        ] as const).map(([value, title]) => (
          <button
            key={value}
            type="button"
            aria-pressed={status === value}
            onClick={() => selectStatus(value)}
            className={`rounded-xl text-left ring-1 transition-all hover:-translate-y-0.5 hover:ring-primary ${status === value ? "bg-primary/15 ring-2 ring-primary" : "bg-card ring-foreground/10"}`}
          >
            <Card className="h-full bg-transparent ring-0">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3">
                  {title}
                  {status === value ? <Check className="text-primary" aria-hidden="true" /> : <Circle className="text-muted-foreground" aria-hidden="true" />}
                </CardTitle>
              </CardHeader>
            </Card>
          </button>
        ))}
      </div>
    </OnboardingShell>
  );
}

function OnboardingShell({ children, step }: { children: React.ReactNode; step: string }) {
  return <main className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-10"><div className="mx-auto max-w-3xl"><header className="flex items-center justify-between gap-4"><Image src="/ns_logo_LIGHT.png" alt="NeuroSync" width={80} height={80} className="size-12 rounded-lg object-contain mix-blend-multiply dark:hidden" priority /><Image src="/NeuroSync_logo.png" alt="NeuroSync" width={80} height={80} className="hidden size-12 rounded-lg object-contain mix-blend-screen dark:block" priority /><Badge variant="secondary">{step}</Badge></header><div className="mx-auto mt-12 max-w-2xl">{children}</div></div></main>;
}
