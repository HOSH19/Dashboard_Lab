"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Person } from "@/lib/types";

type PersonRow = Person & { _count?: { tasks: number } };

export function PeoplePage() {
  const [people, setPeople] = useState<PersonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function loadPeople() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/people");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not load people.");
      }
      setPeople((await res.json()) as PersonRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load people.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPeople();
  }, []);

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/people", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Could not create person.");
        }
        setPeople((current) =>
          [...current, data as PersonRow].sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        );
        setName("");
        setEmail("");
        setOpen(false);
      } catch (err) {
        setFormError(
          err instanceof Error ? err.message : "Could not create person.",
        );
      }
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Workspace</p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            People
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Assignees live here as their own table. Tasks reference a person by
            foreign key — open a board to assign them.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus data-icon="inline-start" />
              Add person
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Add person</DialogTitle>
                <DialogDescription>
                  Emails must be unique. This person can then be selected as a
                  task assignee.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="person-name">Name</Label>
                <Input
                  id="person-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="person-email">Email</Label>
                <Input
                  id="person-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  required
                />
              </div>
              {formError ? (
                <p className="text-sm text-destructive">{formError}</p>
              ) : null}
              <DialogFooter>
                <Button type="submit" disabled={pending}>
                  {pending ? "Saving…" : "Save person"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center text-muted-foreground">
          Loading people…
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
          <p className="font-medium text-destructive">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => void loadPeople()}>
            Try again
          </Button>
        </div>
      ) : people.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <Users className="mx-auto size-10 text-muted-foreground" />
          <h2 className="mt-4 font-heading text-xl font-semibold">No people yet</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Add teammates so you can assign tasks on project boards.
          </p>
          <Button className="mt-6" onClick={() => setOpen(true)}>
            <Plus data-icon="inline-start" />
            Add a person
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium text-right">Tasks</th>
              </tr>
            </thead>
            <tbody>
              {people.map((person) => (
                <tr key={person.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{person.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{person.email}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {person._count?.tasks ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
