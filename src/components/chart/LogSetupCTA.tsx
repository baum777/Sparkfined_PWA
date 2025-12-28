import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export function LogSetupCTA() {
  const navigate = useNavigate();

  const handleLogSetup = () => {
    navigate("/journal");
  };

  return (
    <Button
      onClick={handleLogSetup}
      className="gap-2 focus-visible:ring-offset-background"
      size="lg"
      data-testid="chart-log-setup-cta"
    >
      <BookOpen className="h-4 w-4" aria-hidden="true" />
      Log this setup → Journal
    </Button>
  );
}
