import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.person.deleteMany();

  const [maya, jordan, sam] = await Promise.all([
    prisma.person.create({
      data: { name: "Maya Chen", email: "maya@example.com" },
    }),
    prisma.person.create({
      data: { name: "Jordan Lee", email: "jordan@example.com" },
    }),
    prisma.person.create({
      data: { name: "Sam Ortiz", email: "sam@example.com" },
    }),
  ]);

  const website = await prisma.project.create({
    data: {
      name: "Website Redesign",
      description: "Refresh marketing site and improve page performance.",
      tasks: {
        create: [
          {
            title: "Audit current pages",
            description: "List pages, owners, and traffic for prioritization.",
            status: "done",
            priority: "high",
            assigneeId: maya.id,
          },
          {
            title: "Draft homepage wireframe",
            description: "Hero, product story, and primary CTA layout.",
            status: "in_progress",
            priority: "high",
            assigneeId: jordan.id,
          },
          {
            title: "Collect brand photography",
            description: "Source product and team photos for the new look.",
            status: "todo",
            priority: "medium",
            assigneeId: sam.id,
          },
        ],
      },
    },
  });

  const mobile = await prisma.project.create({
    data: {
      name: "Mobile App v2",
      description: "Ship the next release of the customer mobile app.",
      tasks: {
        create: [
          {
            title: "Define release checklist",
            description: "QA, store assets, and rollout steps.",
            status: "in_progress",
            priority: "high",
            assigneeId: maya.id,
          },
          {
            title: "Fix offline sync bugs",
            description: "Reproduce flaky sync on airplane mode.",
            status: "todo",
            priority: "high",
            assigneeId: jordan.id,
          },
          {
            title: "Write release notes",
            status: "todo",
            priority: "low",
            assigneeId: sam.id,
          },
        ],
      },
    },
  });

  const ops = await prisma.project.create({
    data: {
      name: "Internal Ops",
      description: "Day-to-day operational improvements for the team.",
      tasks: {
        create: [
          {
            title: "Set up weekly standup notes",
            status: "done",
            priority: "low",
            assigneeId: sam.id,
          },
          {
            title: "Document onboarding path",
            description: "First-week checklist for new engineers.",
            status: "todo",
            priority: "medium",
            assigneeId: maya.id,
          },
        ],
      },
    },
  });

  console.log("Seeded projects:", website.name, mobile.name, ops.name);
  console.log("Seeded people:", maya.name, jordan.name, sam.name);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
