import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllSpecs } from "@/lib/handbook/specs";
import { Search, BookOpen, ArrowRight } from "lucide-react";

export default function HandbookPage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const specs = getAllSpecs();

  const filtered = specs.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.purpose.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-brand/20 mb-4">
          <BookOpen className="h-7 w-7 text-brand" />
        </div>
        <h1 className="text-2xl font-semibold text-text-primary mb-2">Handbook</h1>
        <p className="text-text-secondary">Find any page flow in 10 seconds</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
        <Input
          placeholder="Search pages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-surface-subtle border-border-sf-subtle"
        />
      </div>

      <div className="grid gap-3">
        {filtered.map((spec) => (
          <Card key={spec.id} className="card-interactive cursor-pointer" onClick={() => navigate(spec.route)}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{spec.title}</CardTitle>
                <Badge variant="outline" className="text-[10px]">{spec.route}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-text-secondary line-clamp-1">{spec.purpose}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-text-tertiary">{spec.flows.length} flows</span>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-brand">
                  Open <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
