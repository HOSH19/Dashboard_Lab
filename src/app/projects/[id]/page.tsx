import { Suspense } from "react";
import { ProjectBoard } from "@/components/project-board";

type ProjectPageProps = {
  params: Promise<{ id: string }>;
};

async function ProjectBoardLoader({ params }: ProjectPageProps) {
  const { id } = await params;
  return <ProjectBoard projectId={id} />;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-16 text-muted-foreground">
          Loading board…
        </div>
      }
    >
      <ProjectBoardLoader params={params} />
    </Suspense>
  );
}
