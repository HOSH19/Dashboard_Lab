export type Person = {
  id: string;
  name: string;
  email: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  projectId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  assignee?: Person | null;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  _count?: { tasks: number };
  tasks?: Task[];
};
