import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getThemeLabel, type ChildProfile } from "@/lib/child-profile";

export function QuestionnairePlaceholder({
  profile,
  onContinue,
}: {
  profile: ChildProfile;
  onContinue: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <Badge variant="secondary" className="w-fit">QUESTIONNAIRE</Badge>
        <CardTitle className="mt-2 text-2xl">Personalized questionnaire coming soon</CardTitle>
        <CardDescription>
          The questionnaire will be added later. No medical questions are being asked in this placeholder.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2 rounded-xl bg-muted p-4 text-sm">
          <p><span className="font-semibold">Diagnosis status:</span> {profile.diagnosisStatus}</p>
          <p><span className="font-semibold">Selected conditions:</span> {profile.disorders.length ? profile.disorders.map(({ id }) => id.toUpperCase()).join(", ") : "OCD, ADHD, ASD questionnaire planned"}</p>
          <p><span className="font-semibold">Recommended theme:</span> {getThemeLabel(profile.recommendedTheme)}</p>
        </div>
        <Button size="lg" onClick={onContinue}>Continue to dashboard</Button>
      </CardContent>
    </Card>
  );
}
