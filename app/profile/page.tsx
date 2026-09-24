"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Questionnaire } from "@shadcn/react/questionnaire";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";

type Question = {
  name: string;
  prompt: string;
  description: string;
  multiple?: boolean;
  choices: readonly (readonly [string, string])[];
};

type ProfileAnswersRow = {
  user_id: string;
  question_1: string;
  question_2: string;
  question_3: string;
  question_4: string;
  question_5: string;
  question_6: string;
  question_7: string;
  question_8: string;
  question_9: string;
  question_10: string;
  question_11: string;
  question_12: string;
  question_13: string;
  question_14: string;
  completed_at: string;
  updated_at: string;
};

const questions: readonly Question[] = [
  {
    name: "question-1",
    prompt: "How comfortable do you feel having a conversation with another person?",
    description: "Choose the response that best matches your experience.",
    choices: [
      ["1", "Very comfortable"],
      ["2", "Comfortable"],
      ["3", "Somewhat comfortable"],
      ["4", "Neutral"],
      ["5", "Somewhat uncomfortable"],
      ["6", "Uncomfortable"],
      ["7", "Highly uncomfortable"],
    ],
  },
  {
    name: "question-2",
    prompt: "How easily do you pick up new instructions or follow guides?",
    description: "Share as much or as little detail as feels comfortable.",
    choices: [],
  },
  {
    name: "question-3",
    prompt: "How comfortable do you feel picking up new instructions or following guides?",
    description: "Share as much or as little detail as feels comfortable.",
    choices: [],
  },
  {
    name: "question-4",
    prompt: "How would you describe your ability to communicate at your pace?",
    description: "Share as much or as little detail as feels comfortable.",
    choices: [],
  },
  {
    name: "question-5",
    prompt: "How would you describe the way your mind processes concepts and solves daily problems?",
    description: "Share as much or as little detail as feels comfortable.",
    choices: [],
  },
  {
    name: "question-6",
    prompt: "How do physical coordination and hand movements feel in your daily life?",
    description: "Share as much or as little detail as feels comfortable.",
    choices: [],
  },
  {
    name: "question-7",
    prompt: "How easy or difficult is it for you to switch your focus from one thing to another?",
    description: "Share as much or as little detail as feels comfortable.",
    choices: [],
  },
  {
    name: "question-8",
    prompt: "How do bright, fluorescent, or flashing lights affect you?",
    description: "Share as much or as little detail as feels comfortable.",
    choices: [],
  },
  {
    name: "question-9",
    prompt: "How do you react to sudden, sharp, or loud sounds such as horns or alarms?",
    description: "Share as much or as little detail as feels comfortable.",
    choices: [],
  },
  {
    name: "question-10",
    prompt: "How do you feel about routine, repetitive, low-interest tasks such as data entry?",
    description: "Share as much or as little detail as feels comfortable.",
    choices: [],
  },
  {
    name: "question-11",
    prompt: "How do visuals such as bright graphics or moving elements affect you?",
    description: "Share as much or as little detail as feels comfortable.",
    choices: [],
  },
  {
    name: "question-12",
    prompt: "When taking in information or learning, which format works best for your brain?",
    description: "Share as much or as little detail as feels comfortable.",
    choices: [],
  },
  {
    name: "question-13",
    prompt: "How do app notifications and alerts feel for you throughout the day?",
    description: "Share as much or as little detail as feels comfortable.",
    choices: [],
  },
  {
    name: "question-14",
    prompt: "Does your child have any of the following conditions (Autism Spectrum Disorder/Attention Deficit - Hyper Activity Disorder/Obsessive Compulsive Disorder/Not Sure)?",
    description: "Share as much or as little detail as feels comfortable.",
    choices: [],
  },
];

const itemDefinitions = questions.map((question) => ({
  name: question.name,
  required: false,
  ...(question.choices.length > 0
    ? { choices: question.choices.map(([value]) => ({ value })) }
    : {}),
}));

export default function ProfilePage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState("question-1");
  const [missingQuestion, setMissingQuestion] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

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

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    const formData = new FormData(event.currentTarget);
    const firstMissingQuestion = questions.find((question) => {
      const answer = answers[question.name] ?? formData.get(question.name);
      return typeof answer !== "string" || answer.trim().length === 0;
    });

    if (firstMissingQuestion) {
      setMissingQuestion(firstMissingQuestion.name);
      setActiveQuestion(firstMissingQuestion.name);
      return;
    }

    setMissingQuestion(null);
    setSaving(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user) {
        setSubmitError("Your session has expired. Please sign in again.");
        router.replace("/login");
        return;
      }
      const user = session.user;

      const completeAnswers = Object.fromEntries(
        questions.map((question) => [
          question.name,
          answers[question.name] ?? String(formData.get(question.name) ?? ""),
        ]),
      );
      const completedAt = new Date().toISOString();
      const databaseAnswers: ProfileAnswersRow = {
        user_id: user.id,
        question_1: completeAnswers["question-1"],
        question_2: completeAnswers["question-2"],
        question_3: completeAnswers["question-3"],
        question_4: completeAnswers["question-4"],
        question_5: completeAnswers["question-5"],
        question_6: completeAnswers["question-6"],
        question_7: completeAnswers["question-7"],
        question_8: completeAnswers["question-8"],
        question_9: completeAnswers["question-9"],
        question_10: completeAnswers["question-10"],
        question_11: completeAnswers["question-11"],
        question_12: completeAnswers["question-12"],
        question_13: completeAnswers["question-13"],
        question_14: completeAnswers["question-14"],
        completed_at: completedAt,
        updated_at: completedAt,
      };

      const { error: saveError } = await supabase
        .from("profile_answers")
        .upsert(
          databaseAnswers,
          { onConflict: "user_id" },
        );

      if (saveError) throw saveError;

      localStorage.setItem("neurosync-profile-answers", JSON.stringify(completeAnswers));
      localStorage.setItem("neurosync-profile-complete", "true");
      router.push("/dashboard");
    } catch (caught) {
      setSubmitError(caught instanceof Error ? caught.message : "Unable to save your profile answers.");
    } finally {
      setSaving(false);
    }
  }

  if (!authChecked) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#080808] text-sm text-neutral-500">
        Loading questions…
      </main>
    );
  }

  return (
    <main className="dark min-h-screen bg-[#080808] px-4 py-16 text-[#f5f5f5] sm:py-24">
      <Questionnaire.Root
        items={itemDefinitions}
        item={activeQuestion}
        onItemChange={setActiveQuestion}
        onSubmit={submit}
        shortcuts="letters"
        className="mx-auto flex w-full max-w-[470px] flex-col gap-6"
      >
        <Questionnaire.Progress className="text-[13px] font-medium text-neutral-500" />
        {submitError && (
          <p role="alert" className="text-xs text-red-400">
            {submitError}
          </p>
        )}

        {questions.map((question) => (
          <Questionnaire.Item
            key={question.name}
            name={question.name}
            required={false}
            multiple={question.multiple}
            className="flex flex-col gap-0"
          >
            <Questionnaire.Title className="text-[18px] font-semibold leading-6 tracking-[-0.01em] text-neutral-100">
              {question.prompt}
            </Questionnaire.Title>
            <Questionnaire.Description className="mt-1.5 text-sm leading-5 text-neutral-500">
              {question.description}
            </Questionnaire.Description>

            <Questionnaire.Choices className="mt-5 flex flex-col gap-2">
              {question.choices.length > 0 ? (
                question.choices.map(([value, label]) => (
                  <Questionnaire.Choice
                    key={value}
                    value={value}
                    onChange={(event) => {
                      setAnswers((current) => ({
                        ...current,
                        [question.name]: event.target.value,
                      }));
                    }}
                    className="flex min-h-12 cursor-pointer items-center gap-3 rounded-[10px] border border-[#292929] bg-[#111111] px-3 transition-colors hover:bg-[#171717] focus-within:border-[#555555] data-checked:border-[#555555] data-checked:bg-[#181818]"
                  >
                    <Questionnaire.ChoiceInput className="size-4 shrink-0 rounded border-[#555555] bg-[#111111] accent-white focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]" />
                    <Questionnaire.ChoiceLabel className="flex-1 text-sm font-medium text-[#f5f5f5]">
                      {label}
                    </Questionnaire.ChoiceLabel>
                    <Questionnaire.ChoiceShortcut className="grid size-5 shrink-0 place-items-center rounded-[6px] border border-[#292929] bg-[#0b0b0b] text-[11px] font-medium text-neutral-500" />
                  </Questionnaire.Choice>
                ))
              ) : (
                <Questionnaire.Input
                  aria-label={`Answer for ${question.prompt}`}
                  value={answers[question.name] ?? ""}
                  onChange={(event) => {
                    setAnswers((current) => ({
                      ...current,
                      [question.name]: event.target.value,
                    }));
                  }}
                  render={
                    <Textarea className="min-h-36 resize-none border-[#292929] bg-[#111111] text-sm text-[#f5f5f5] placeholder:text-neutral-600" />
                  }
                  placeholder="Write your answer here..."
                />
              )}
            </Questionnaire.Choices>
            <Questionnaire.Error className="mt-2 text-xs text-red-400" />
            {missingQuestion === question.name && (
              <p className="mt-2 text-xs text-red-400">
                Please answer this question before submitting.
              </p>
            )}
          </Questionnaire.Item>
        ))}

        <div className="flex items-center justify-between gap-3 pt-1">
          <Questionnaire.Previous
            render={<Button variant="outline" size="sm" />}
            data-navigation-action
          >
            Previous
          </Questionnaire.Previous>
          <div className="flex items-center gap-2">
            {activeQuestion !== "question-14" && (
              <Questionnaire.Skip
                render={<Button variant="outline" size="sm" />}
                data-navigation-action
              >
                Skip
              </Questionnaire.Skip>
            )}
            <Questionnaire.Next
              render={<Button size="sm" />}
              data-navigation-action
            >
              Next
            </Questionnaire.Next>
            <Questionnaire.Submit
              render={<Button size="sm" disabled={saving} />}
              data-navigation-action
            >
              {saving ? "Saving…" : "Submit"}
            </Questionnaire.Submit>
          </div>
        </div>
      </Questionnaire.Root>
    </main>
  );
}
