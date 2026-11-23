"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/constants";
import type { Person, Project, Task } from "@/lib/types";

type ProjectBoardProps = {
  projectId: string;
};

const UNASSIGNED = "__unassigned__";

export function ProjectBoard({ projectId }: ProjectBoardProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assigneeId, setAssigneeId] = useState(UNASSIGNED);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [projectRes, peopleRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch("/api/people"),
      ]);

      if (!projectRes.ok) {
        const data = await projectRes.json().catch(() => ({}));
        throw new Error(data.error || "Could not load project.");
      }
      if (!peopleRes.ok) {
        const data = await peopleRes.json().catch(() => ({}));
        throw new Error(data.error || "Could not load people.");
      }

      setProject((await projectRes.json()) as Project);
      setPeople((await peopleRes.json()) as Person[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load board.");
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  function resetCreateForm() {
    setTitle("");
    setDescription("");
    setStatus("todo");
    setPriority("medium");
    setAssigneeId(UNASSIGNED);
    setFormError(null);
  }

  function openEdit(task: Task) {
    setEditTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status as TaskStatus);
    setPriority(task.priority as TaskPriority);
    setAssigneeId(task.assigneeId ?? UNASSIGNED);
    setFormError(null);
  }

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            title,
            description,
            status,
            priority,
            assigneeId: assigneeId === UNASSIGNED ? null : assigneeId,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Could not create task.");
        }
        setProject((current) =>
          current
            ? { ...current, tasks: [data as Task, ...(current.tasks ?? [])] }
            : current,
        );
        resetCreateForm();
        setCreateOpen(false);
      } catch (err) {
        setFormError(
          err instanceof Error ? err.message : "Could not create task.",
        );
      }
    });
  }

  function handleUpdate(event: React.FormEvent) {
    event.preventDefault();
    if (!editTask) return;
    setFormError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/tasks/${editTask.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            status,
            priority,
            assigneeId: assigneeId === UNASSIGNED ? null : assigneeId,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Could not update task.");
        }
        const updated = data as Task;
        setProject((current) =>
          current
            ? {
                ...current,
                tasks: (current.tasks ?? []).map((task) =>
                  task.id === updated.id ? updated : task,
                ),
              }
            : current,
        );
        setEditTask(null);
      } catch (err) {
        setFormError(
          err instanceof Error ? err.message : "Could not update task.",
        );
      }
    });
  }

  function moveTask(task: Task, nextStatus: TaskStatus) {
    if (task.status === nextStatus) return;
    startTransition(async () => {
      const previous = project;
      setProject((current) =>
        current
          ? {
              ...current,
              tasks: (current.tasks ?? []).map((item) =>
                item.id === task.id ? { ...item, status: nextStatus } : item,
              ),
            }
          : current,
      );

      try {
        const res = await fetch(`/api/tasks/${task.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Could not move task.");
        }
        const updated = data as Task;
        setProject((current) =>
          current
            ? {
                ...current,
                tasks: (current.tasks ?? []).map((item) =>
                  item.id === updated.id ? updated : item,
                ),
              }
            : current,
        );
      } catch {
        setProject(previous);
        setError("Could not move that task. Try again.");
      }
    });
  }

  function deleteTask(taskId: string) {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || "Could not delete task.");
        }
        setProject((current) =>
          current
            ? {
                ...current,
                tasks: (current.tasks ?? []).filter((task) => task.id !== taskId),
              }
            : current,
        );
        setEditTask(null);
      } catch (err) {
        setFormError(
          err instanceof Error ? err.message : "Could not delete task.",
        );
      }
    });
  }

  const taskForm = (mode: "create" | "edit") => (
    <form
      onSubmit={mode === "create" ? handleCreate : handleUpdate}
      className="space-y-4"
    >
      <DialogHeader>
        <DialogTitle>{mode === "create" ? "Add task" : "Edit task"}</DialogTitle>
        <DialogDescription>
          Tasks belong to this project and can optionally point at a person row.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-2">
        <Label htmlFor={`${mode}-title`}>Title</Label>
        <Input
          id={`${mode}-title`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ship onboarding checklist"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${mode}-description`}>Description</Label>
        <Textarea
          id={`${mode}-description`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Optional details for whoever picks this up."
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as TaskStatus)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {STATUS_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={priority}
            onValueChange={(value) => setPriority(value as TaskPriority)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_PRIORITIES.map((value) => (
                <SelectItem key={value} value={value}>
                  {PRIORITY_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Assignee</Label>
        <Select value={assigneeId} onValueChange={setAssigneeId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Unassigned" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
            {people.map((person) => (
              <SelectItem key={person.id} value={person.id}>
                {person.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
      <DialogFooter className="gap-2 sm:justify-between">
        {mode === "edit" && editTask ? (
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={() => deleteTask(editTask.id)}
          >
            Delete
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" disabled={pending}>
          {pending
            ? mode === "create"
              ? "Adding…"
              : "Saving…"
            : mode === "create"
              ? "Add task"
              : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  );

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-16 text-muted-foreground">
        Loading board…
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="font-medium text-destructive">{error}</p>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/">Back to projects</Link>
          </Button>
          <Button onClick={() => void load()}>Try again</Button>
        </div>
      </div>
    );
  }

  if (!project) return null;

  const tasks = project.tasks ?? [];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
          <Link href="/">
            <ArrowLeft data-icon="inline-start" />
            All projects
          </Link>
        </Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              {project.name}
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              {project.description || "No description yet."}
            </p>
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
          </div>

          <Dialog
            open={createOpen}
            onOpenChange={(next) => {
              setCreateOpen(next);
              if (next) resetCreateForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus data-icon="inline-start" />
                Add task
              </Button>
            </DialogTrigger>
            <DialogContent>{taskForm("create")}</DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {TASK_STATUSES.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column);
          return (
            <section
              key={column}
              className="flex min-h-72 flex-col rounded-xl border border-border bg-muted/20"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold">{STATUS_LABELS[column]}</h2>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {columnTasks.length}
                </span>
              </div>
              <ul className="flex flex-1 flex-col gap-3 p-3">
                {columnTasks.length === 0 ? (
                  <li className="rounded-lg border border-dashed border-border px-3 py-8 text-center text-sm text-muted-foreground">
                    No tasks here yet.
                  </li>
                ) : (
                  columnTasks.map((task) => (
                    <li key={task.id}>
                      <article className="w-full rounded-lg border border-border bg-background p-3 text-left transition-colors hover:border-foreground/20 hover:bg-accent/30">
                        <button
                          type="button"
                          onClick={() => openEdit(task)}
                          className="w-full text-left"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium leading-snug">
                              {task.title}
                            </p>
                            <Badge
                              variant="secondary"
                              className="shrink-0 capitalize"
                            >
                              {PRIORITY_LABELS[task.priority as TaskPriority] ??
                                task.priority}
                            </Badge>
                          </div>
                          {task.description ? (
                            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                              {task.description}
                            </p>
                          ) : null}
                        </button>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {task.assignee?.name ?? "Unassigned"}
                          </span>
                          <div className="ml-auto flex gap-1">
                            {TASK_STATUSES.filter(
                              (value) => value !== column,
                            ).map((value) => (
                              <Button
                                key={value}
                                type="button"
                                size="xs"
                                variant="outline"
                                disabled={pending}
                                onClick={() => moveTask(task, value)}
                              >
                                {STATUS_LABELS[value]}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </article>
                    </li>
                  ))
                )}
              </ul>
            </section>
          );
        })}
      </div>

      <Dialog
        open={Boolean(editTask)}
        onOpenChange={(next) => {
          if (!next) setEditTask(null);
        }}
      >
        <DialogContent>{taskForm("edit")}</DialogContent>
      </Dialog>
    </div>
  );
}
