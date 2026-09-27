"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { ArrowUpRight, Droplets, Waves } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SensoryActivity = {
  id: string;
  title: string;
  description: string;
  preview: ReactNode;
  actionLabel: string;
  onSelect: () => void;
};

function ActivityCard({ activity }: { activity: SensoryActivity }) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activity.onSelect();
    }
  }

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-label={`${activity.title}. ${activity.actionLabel}`}
      onClick={activity.onSelect}
      onKeyDown={handleKeyDown}
      className="group cursor-pointer overflow-hidden transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
    >
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 via-secondary to-accent/20">
        {activity.preview}
        <span className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-background/80 text-primary shadow-sm">
          <ArrowUpRight aria-hidden="true" />
        </span>
      </div>
      <CardHeader className="gap-2">
        <Badge variant="secondary" className="w-fit">FLUID SIMULATION</Badge>
        <CardTitle className="text-xl">{activity.title}</CardTitle>
        <CardDescription>{activity.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors group-hover:bg-primary/80">
          <Droplets aria-hidden="true" />
          {activity.actionLabel}
        </span>
      </CardContent>
    </Card>
  );
}

function FluidPreview() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-8 top-10 size-40 rounded-full bg-primary/70 blur-2xl transition-transform duration-700 group-hover:translate-x-8" />
      <div className="absolute right-8 -top-10 size-44 rounded-full bg-accent/70 blur-2xl transition-transform duration-700 group-hover:-translate-y-4" />
      <div className="absolute bottom-[-5rem] left-1/3 size-48 rounded-full bg-secondary blur-2xl transition-transform duration-700 group-hover:-translate-x-8" />
      <div className="absolute inset-0 grid place-items-center">
        <Waves className="size-20 text-foreground/70 drop-shadow-sm" strokeWidth={1.4} />
      </div>
    </div>
  );
}

export function SensoryRoom({ onPlayFluid }: { onPlayFluid: () => void }) {
  const activities: SensoryActivity[] = [
    {
      id: "fluid-play",
      title: "Fluid Play",
      description: "Touch, move, and watch the colors flow. There is no right or wrong way to play.",
      preview: <FluidPreview />,
      actionLabel: "Let's play",
      onSelect: onPlayFluid,
    },
  ];

  return (
    <section aria-labelledby="sensory-room-title" className="space-y-6">
      <div>
        <Badge variant="secondary">A CALM PLACE TO EXPLORE</Badge>
        <h1 id="sensory-room-title" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Sensory Room
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Choose a gentle activity. You can leave whenever you like.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {activities.map((activity) => <ActivityCard key={activity.id} activity={activity} />)}
      </div>

      <p className="text-xs text-muted-foreground">
        Fluid Simulation by{" "}
        <a
          href="https://github.com/PavelDoGreat/WebGL-Fluid-Simulation"
          target="_blank"
          rel="noreferrer"
          className="font-medium underline underline-offset-4 hover:text-foreground"
        >
          Pavel Dobryakov
        </a>
        {" · "}
        <a href="/fluid-simulation/LICENSE" target="_blank" className="font-medium underline underline-offset-4 hover:text-foreground">
          MIT License
        </a>
      </p>
    </section>
  );
}
