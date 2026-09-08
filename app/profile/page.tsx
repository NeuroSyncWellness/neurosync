"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const responseOptions = [
  { value: 1, label: "Very comfortable", size: "size-11", color: "border-primary text-primary" },
  { value: 2, label: "Comfortable", size: "size-9", color: "border-primary/80 text-primary" },
  { value: 3, label: "Somewhat comfortable", size: "size-7", color: "border-primary/60 text-primary" },
  { value: 4, label: "Neutral", size: "size-6", color: "border-muted-foreground text-muted-foreground" },
  { value: 5, label: "Somewhat uncomfortable", size: "size-7", color: "border-warm/70 text-warm" },
  { value: 6, label: "Uncomfortable", size: "size-9", color: "border-warm/85 text-warm" },
  { value: 7, label: "Highly uncomfortable", size: "size-11", color: "border-warm text-warm" },
];

const questions = [
  "How comfortable do you feel having a conversation with another person",
  "How easily do you pick up new instructions or follow guides",
  "How comfortable do you pick up new instructios or follow guide?",
  "How would you describe your ability to communicate at your pace?",
  "How would you describe the way your mind process concepts and solve daily problems?",
  "How do physical coordination and hand movements feel in your daily life?",
  "How easy or difficult is it for you to switch your focus from one thing to another?",
  "How do bright, fluorescent, or flashing lights affect you?",
  "How do you react to sudden, sharp, or loud sounds (like horns or alarms)?",
  "How do you feel about routine, repetitive, low-interest tasks (like data entry)?",
  "How do visuals (like bright graphics or moving elements) affect you?",
  "When taking in information or learning, which format works best for your brain?",
  "How do app notifications and alerts feel for you throughout the day?",
  "How do you prefer the app visuals, style, colours, and typography to look?",
];

export default function ProfilePage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number | string>>({});

  useEffect(() => {
    try {
      if (!localStorage.getItem("neurosync-parent-session")) {
        window.location.replace("/login");
        return;
      }
      if (!localStorage.getItem("neurosync-child-session")) {
        window.location.replace("/login/child");
        return;
      }
      const frame = requestAnimationFrame(() => setAuthChecked(true));
      return () => cancelAnimationFrame(frame);
    } catch {
      window.location.replace("/login");
    }
  }, []);

  if (!authChecked) {
    return <main className="grid min-h-screen place-items-center bg-muted/30 text-sm text-muted-foreground">Loading profile questions…</main>;
  }

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between gap-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard"><ArrowLeft /> Back to dashboard</Link>
          </Button>
          <Badge variant="secondary">Profile setup</Badge>
        </header>

        <section className="mx-auto mt-10 max-w-2xl text-center">
          <Badge className="border-primary/20 bg-primary/10 text-primary">PERSONALISED EXPERIENCE</Badge>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Complete your profile</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Tell us more about your family&apos;s needs so we can tailor NeuroSync to you.
          </p>
        </section>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ClipboardList className="text-primary" /> Profile questionnaire</CardTitle>
            <CardDescription>Select the option that best describes your experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <QuestionScale
              number={1}
              question={questions[0]}
              selected={typeof answers[1] === "number" ? answers[1] : undefined}
              onSelect={(value) => setAnswers((current) => ({ ...current, 1: value }))}
            />
            <fieldset className="rounded-xl border bg-background p-5 sm:p-6">
              <legend className="max-w-full px-1 text-base font-semibold leading-6 sm:text-lg">
                Q2. {questions[1]}
              </legend>
              <Textarea
                value={typeof answers[2] === "string" ? answers[2] : ""}
                onChange={(event) => setAnswers((current) => ({ ...current, 2: event.target.value }))}
                placeholder="Enter the answer"
                className="mt-6 min-h-32 min-w-0 resize-y border-foreground/20 bg-foreground text-background placeholder:text-background/60 focus-visible:ring-primary"
              />
            </fieldset>
            {questions.slice(2).map((question, index) => {
              const number = index + 3;
              return (
                <fieldset key={question} className="rounded-xl border bg-background p-5 sm:p-6">
                  <legend className="max-w-full px-1 text-base font-semibold leading-6 sm:text-lg">
                    Q{number}. {question}
                  </legend>
                  <Textarea
                    value={typeof answers[number] === "string" ? answers[number] : ""}
                    onChange={(event) => setAnswers((current) => ({ ...current, [number]: event.target.value }))}
                    placeholder="Enter the answer"
                    className="mt-6 min-h-32 min-w-0 resize-y border-foreground/20 bg-foreground text-background placeholder:text-background/60 focus-visible:ring-primary"
                  />
                </fieldset>
              );
            })}
            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={() => {
                localStorage.setItem("neurosync-profile-answers", JSON.stringify(answers));
                localStorage.setItem("neurosync-profile-complete", "true");
                router.push("/dashboard");
              }}
            >
              Submit
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function QuestionScale({
  number,
  question,
  selected,
  onSelect,
}: {
  number: number;
  question: string;
  selected?: number;
  onSelect: (value: number) => void;
}) {
  return (
    <fieldset className="rounded-xl border bg-background p-5 sm:p-6">
      <legend className="max-w-full px-1 text-base font-semibold leading-6 sm:text-lg">
        Q{number}. {question}
      </legend>
      <div className="mt-6 overflow-x-auto pb-2">
        <div className="mx-auto flex min-w-[22rem] items-center justify-center gap-3 sm:gap-5">
          {responseOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              title={option.label}
              aria-label={`${option.value}: ${option.label}`}
              aria-pressed={selected === option.value}
              onClick={() => onSelect(option.value)}
              className={`grid shrink-0 place-items-center rounded-full border-2 bg-transparent transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${option.size} ${option.color} ${selected === option.value ? "ring-2 ring-primary ring-offset-2" : ""}`}
            >
              {selected === option.value && <Check className="size-4" />}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-4 text-xs font-medium text-muted-foreground">
        <span className="text-primary">Very comfortable</span>
        <span className="text-center">Neutral</span>
        <span className="text-right text-warm">Highly uncomfortable</span>
      </div>
      {selected && <p className="mt-4 text-sm text-primary">Selected: {responseOptions[selected - 1].label}</p>}
    </fieldset>
  );
}
