"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, LogOut, Moon, Sun, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/lib/supabase/client";
import { CHILD_ACTIVE_THEME_STORAGE_KEY, readChildProfile, saveChildProfile, type ChildTheme } from "@/lib/child-profile";

export default function DashboardSettingsPage() {
  const router = useRouter();
  const [dark, setDark] = useState(
      () =>
        typeof window !== "undefined" &&
        localStorage.getItem("neurosync-theme") === "dark"
    );

    const [palette, setPalette] = useState(() => {
      if (typeof window === "undefined") return "purple";

      return localStorage.getItem("neurosync-palette") || "purple";
    });
  const [volume, setVolume] = useState(35);
  const [notifications, setNotifications] = useState(true);
  const [message, setMessage] = useState("");
  const [childTheme, setChildTheme] = useState<ChildTheme>("universal");

  
  useEffect(() => {
    const storedTheme = localStorage.getItem("neurosync-theme");
    const useDark = storedTheme === "dark";

    const storedPalette =
      localStorage.getItem("neurosync-palette") || "purple";

    document.documentElement.classList.toggle("dark", useDark);

    let theme = "parent-purple-light";

    if (storedPalette === "plum") {
      theme = useDark
        ? "parent-plum-dark"
        : "parent-plum-light";
    } else if (storedPalette === "plum-contrast") {
      theme = "parent-plum-contrast";
    } else {
      theme = useDark
        ? "parent-purple-dark"
        : "parent-purple-light";
    }

    document.documentElement.setAttribute(
      "data-theme",
      theme
    );
    const frame = requestAnimationFrame(() => {
      const childProfile = readChildProfile();
      if (childProfile) setChildTheme(localStorage.getItem(CHILD_ACTIVE_THEME_STORAGE_KEY) as ChildTheme || childProfile.activeTheme);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function selectChildTheme(theme: ChildTheme) {
    setChildTheme(theme);
    const profile = readChildProfile();
    if (profile) saveChildProfile({ ...profile, activeTheme: theme });
    setMessage(`Child Mode theme changed to ${theme.replace("_", " + ").toUpperCase()}.`);
  }

    function selectPalette(nextPalette: string) {
    setPalette(nextPalette);

    localStorage.setItem(
      "neurosync-palette",
      nextPalette
    );

    let theme = "parent-purple-light";

    if (nextPalette === "plum") {
      theme = dark
        ? "parent-plum-dark"
        : "parent-plum-light";
    } else if (nextPalette === "plum-contrast") {
      theme = "parent-plum-contrast";
    } else {
      theme = dark
        ? "parent-purple-dark"
        : "parent-purple-light";
    }

    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    setMessage(
      `Palette changed to ${nextPalette}.`
    );
  }


  function toggleTheme() {
    const next = !dark;

    setDark(next);

    localStorage.setItem(
      "neurosync-theme",
      next ? "dark" : "light"
    );

    const storedPalette =
      localStorage.getItem("neurosync-palette") || "purple";

    let theme = "parent-purple-light";

    if (storedPalette === "plum") {
      theme = next
        ? "parent-plum-dark"
        : "parent-plum-light";
    } else if (storedPalette === "plum-contrast") {
      theme = "parent-plum-contrast";
    } else {
      theme = next
        ? "parent-purple-dark"
        : "parent-purple-light";
    }

    document.documentElement.classList.toggle(
      "dark",
      next
    );

    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    setMessage(
      `Theme changed to ${next ? "dark" : "light"} mode.`
    );
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setMessage(error.message);
      return;
    }
    localStorage.removeItem("neurosync-parent-session");
    localStorage.removeItem("neurosync-child-session");
    localStorage.removeItem("neurosync-profile-answers");
    localStorage.removeItem("neurosync-profile-complete");
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center justify-between gap-4">
          <Button variant="ghost" render={<Link href="/dashboard" />} nativeButton={false}>
            <ArrowLeft data-icon="inline-start" /> Back to dashboard
          </Button>
          <Image src="/ns_logo_LIGHT.png" alt="NeuroSync" width={80} height={80} className="size-12 rounded-lg object-contain mix-blend-multiply dark:hidden" priority />
          <Image src="/NeuroSync_logo.png" alt="NeuroSync" width={80} height={80} className="hidden size-12 rounded-lg object-contain mix-blend-screen dark:block" priority />
          <Badge variant="secondary">Settings</Badge>
        </header>

        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Family Mode Settings</CardTitle>
            <CardDescription>Manage the controls for your NeuroSync family space.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-xl bg-muted p-4">
              <div className="flex items-center gap-3">
                <Volume2 className="size-5 text-primary" />
                <div className="flex-1">
                  <p className="font-semibold">Audio</p>
                  <p className="text-sm text-muted-foreground">Adjust sensory audio volume.</p>
                </div>
                <span className="text-sm font-semibold">{volume}%</span>
              </div>
              <Slider className="mt-4" min={0} max={100} value={volume} onValueChange={(value) => setVolume(value as number)} />
            </div>

            <Button variant="outline" className="h-auto justify-start p-4" onClick={() => {
              setNotifications((current) => !current);
              setMessage(`Notifications ${notifications ? "disabled" : "enabled"}.`);
            }}>
              <Bell />
              <span className="text-left">
                <span className="block font-semibold">Notifications</span>
                <span className="block text-sm text-muted-foreground">{notifications ? "Notifications are enabled." : "Notifications are disabled."}</span>
              </span>
            </Button>

            
            <div className="rounded-xl bg-muted p-4">
              <div className="mb-3">
                <p className="font-semibold">Color Palette</p>
                <p className="text-sm text-muted-foreground">
                  Choose the color style for your family space.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <Button
                  variant={palette === "purple" ? "default" : "outline"}
                  onClick={() => selectPalette("purple")}
                >
                  Purple
                </Button>

                <Button
                  variant={palette === "plum" ? "default" : "outline"}
                  onClick={() => selectPalette("plum")}
                >
                  Plum
                </Button>

                <Button
                  variant={palette === "plum-contrast" ? "default" : "outline"}
                  onClick={() => selectPalette("plum-contrast")}
                >
                  Plum Contrast
                </Button>
              </div>
            </div>

            <Button variant="outline" className="h-auto justify-start p-4" onClick={toggleTheme}>
              {dark ? <Sun /> : <Moon />}
              <span className="text-left">
                <span className="block font-semibold">Theme</span>
                <span className="block text-sm text-muted-foreground">Switch between light and dark appearance.</span>
              </span>
            </Button>

            <div className="rounded-xl bg-muted p-4">
              <div className="mb-3">
                <p className="font-semibold">Child Mode theme</p>
                <p className="text-sm text-muted-foreground">Change the active theme without changing diagnosis information.</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-4">
                {(["universal", "ocd", "adhd", "asd", "ocd_adhd", "ocd_asd", "adhd_asd"] as ChildTheme[]).map((theme) => (
                  <Button key={theme} variant={childTheme === theme ? "default" : "outline"} onClick={() => selectChildTheme(theme)}>
                    {theme.replace("_", " + ").toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            <Button variant="destructive" className="h-auto justify-start p-4" onClick={logout}>
              <LogOut />
              <span className="text-left">
                <span className="block font-semibold">Logout</span>
                <span className="block text-sm opacity-80">Sign out of your NeuroSync account.</span>
              </span>
            </Button>

            {message && <p role="status" className="rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">{message}</p>}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
