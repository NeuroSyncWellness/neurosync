"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowLeft, Mail, Phone, UserCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";

type ProfileDetails = {
  name: string;
  email: string;
  phone: string;
};

export default function DashboardProfilePage() {
  const [details, setDetails] = useState<ProfileDetails>({
    name: "Loading...",
    email: "Loading...",
    phone: "Not provided",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setError(userError.message);
        return;
      }

      const metadata = data.user?.user_metadata ?? {};
      let savedParent: Record<string, unknown> = {};
      try {
        const stored = localStorage.getItem("neurosync-parent-session");
        if (stored) savedParent = JSON.parse(stored) as Record<string, unknown>;
      } catch {
        savedParent = {};
      }

      const firstName = typeof metadata.firstName === "string"
        ? metadata.firstName
        : typeof savedParent.firstName === "string" ? savedParent.firstName : "";
      const lastName = typeof metadata.lastName === "string"
        ? metadata.lastName
        : typeof savedParent.lastName === "string" ? savedParent.lastName : "";
      const phone = typeof metadata.phone === "string"
        ? metadata.phone
        : typeof savedParent.phone === "string" ? savedParent.phone : "";

      setDetails({
        name: [firstName, lastName].filter(Boolean).join(" ") || "Not provided",
        email: data.user?.email || "Not provided",
        phone: phone || "Not provided",
      });
    }

    void loadProfile();
  }, []);

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center justify-between gap-4">
          <Button variant="ghost" render={<Link href="/dashboard" />} nativeButton={false}>
            <ArrowLeft data-icon="inline-start" /> Back to dashboard
          </Button>
          <Image src="/ns_logo_LIGHT.png" alt="NeuroSync" width={80} height={80} className="size-12 rounded-lg object-contain mix-blend-multiply dark:hidden" priority />
          <Image src="/NeuroSync_logo.png" alt="NeuroSync" width={80} height={80} className="hidden size-12 rounded-lg object-contain mix-blend-screen dark:block" priority />
          <Badge variant="secondary">Profile</Badge>
        </header>

        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="size-5 text-primary" /> User information
            </CardTitle>
            <CardDescription>Your account details from Supabase.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {error && <p role="alert" className="rounded-xl bg-destructive/15 px-3 py-2 text-sm text-destructive">{error}</p>}
            <div className="flex items-center gap-3 rounded-xl bg-muted p-4">
              <UserCircle className="size-5 text-primary" />
              <div><p className="text-xs text-muted-foreground">User name</p><p className="font-semibold">{details.name}</p></div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-muted p-4">
              <Mail className="size-5 text-primary" />
              <div><p className="text-xs text-muted-foreground">User email</p><p className="font-semibold">{details.email}</p></div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-muted p-4">
              <Phone className="size-5 text-primary" />
              <div><p className="text-xs text-muted-foreground">Contact number</p><p className="font-semibold">{details.phone}</p></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
