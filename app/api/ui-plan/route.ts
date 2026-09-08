import { OpenRouter } from "@openrouter/sdk";

type FormAnswers = {
  childName: string;
  supportFocus: string;
  sensoryLevel: string;
  communication: string;
  interfaceStyle: string;
};

type UIPlan = {
  welcome: string;
  summary: string;
  palette: "sage" | "sand" | "lavender";
  density: "comfortable" | "spacious";
  textScale: "standard" | "large";
  motion: "reduced" | "gentle";
  modules: string[];
  firstStep: string;
};

const allowedValues = {
  supportFocus: ["focus", "calm", "routines", "communication"],
  sensoryLevel: ["low", "balanced", "engaging"],
  communication: ["visual", "audio", "both"],
  interfaceStyle: ["simple", "guided", "playful"],
};

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function extractJson(content: string) {
  const match = content.replace(/```json\s*|\s*```/g, "").match(/\{[\s\S]*\}/);
  if (!match) throw new Error("The model did not return a UI plan.");
  return JSON.parse(match[0]) as unknown;
}

function isPlan(value: unknown): value is UIPlan {
  if (!value || typeof value !== "object") return false;
  const plan = value as Record<string, unknown>;
  return typeof plan.welcome === "string"
    && typeof plan.summary === "string"
    && ["sage", "sand", "lavender"].includes(plan.palette as string)
    && ["comfortable", "spacious"].includes(plan.density as string)
    && ["standard", "large"].includes(plan.textScale as string)
    && ["reduced", "gentle"].includes(plan.motion as string)
    && Array.isArray(plan.modules)
    && plan.modules.length === 3
    && plan.modules.every((module) => typeof module === "string")
    && typeof plan.firstStep === "string";
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "OpenRouter is not configured." }, { status: 503 });
  }

  let body: Partial<FormAnswers>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Please send valid form data." }, { status: 400 });
  }

  const answers: FormAnswers = {
    childName: cleanText(body.childName, 40) || "Your child",
    supportFocus: cleanText(body.supportFocus, 20),
    sensoryLevel: cleanText(body.sensoryLevel, 20),
    communication: cleanText(body.communication, 20),
    interfaceStyle: cleanText(body.interfaceStyle, 20),
  };

  if (Object.entries(allowedValues).some(([key, values]) => !values.includes(answers[key as keyof typeof allowedValues]))) {
    return Response.json({ error: "One or more preferences are invalid." }, { status: 400 });
  }

  const prompt = `Create a small, supportive UI plan for a caregiver app. This is not medical advice and must not diagnose, predict health outcomes, or mention a disorder. Use only the preferences below.

Preferences:
${JSON.stringify(answers)}

Return JSON only, exactly matching this shape:
{
  "welcome": "a warm sentence of 16 words or fewer",
  "summary": "a practical sentence of 24 words or fewer",
  "palette": "sage" | "sand" | "lavender",
  "density": "comfortable" | "spacious",
  "textScale": "standard" | "large",
  "motion": "reduced" | "gentle",
  "modules": ["module title", "module title", "module title"],
  "firstStep": "an actionable next step of 12 words or fewer"
}`;

  try {
    const openRouter = new OpenRouter({
      apiKey,
      appTitle: "NeuroSync UI Planner",
    });
    const response = await openRouter.chat.send({
      chatRequest: {
        model: "openrouter/free",
        messages: [
          { role: "system", content: "You design accessible, low-stimulation caregiver interfaces. Return valid JSON only." },
          { role: "user", content: prompt },
        ],
        temperature: 0.35,
        maxTokens: 300,
        stream: false,
      },
    });

    if (!("choices" in response)) throw new Error("The model returned a streaming response.");
    const content = response.choices[0]?.message.content;
    if (typeof content !== "string") throw new Error("No model response.");

    const plan = extractJson(content);
    if (!isPlan(plan)) throw new Error("The model returned an invalid UI plan.");
    return Response.json({ plan });

  } catch {
    return Response.json({ error: "We could not create a UI plan right now. Please try again." }, { status: 502 });
  }
}
