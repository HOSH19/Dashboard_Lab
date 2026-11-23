"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { FolderKanban, Plus } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import type { Project } from "@/lib/types";

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function loadProjects() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not load projects.");
      }
      const data = (await res.json()) as Project[];
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load projects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProjects();
  }, []);

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Could not create project.");
        }
        setProjects((current) => [data as Project, ...current]);
        setName("");
        setDescription("");
        setOpen(false);
      } catch (err) {
        setFormError(
          err instanceof Error ? err.message : "Could not create project.",
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
            Projects
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Each project owns a board of tasks. Open one to move work across
            status columns and assign people from the shared roster.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus data-icon="inline-start" />
              New project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Create project</DialogTitle>
                <DialogDescription>
                  Projects group related tasks. You can add the board items
                  after this is created.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="project-name">Name</Label>
                <Input
                  id="project-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Website redesign"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-description">Description</Label>
                <Textarea
                  id="project-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this project trying to finish?"
                  rows={3}
                />
              </div>
              {formError ? (
                <p className="text-sm text-destructive">{formError}</p>
              ) : null}
              <DialogFooter>
                <Button type="submit" disabled={pending}>
                  {pending ? "Creating…" : "Create project"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center text-muted-foreground">
          Loading projects…
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
          <p className="font-medium text-destructive">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => void loadProjects()}>
            Try again
          </Button>
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <FolderKanban className="mx-auto size-10 text-muted-foreground" />
          <h2 className="mt-4 font-heading text-xl font-semibold">No projects yet</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Create your first project to open a board and start adding tasks.
          </p>
          <Button className="mt-6" onClick={() => setOpen(true)}>
            <Plus data-icon="inline-start" />
            Create a project
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}`}
                className="block h-full rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/20 hover:bg-accent/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-heading text-lg font-semibold tracking-tight">
                    {project.name}
                  </h2>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {project._count?.tasks ?? 0} tasks
                  </span>
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {project.description || "No description yet."}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
