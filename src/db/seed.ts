import { quizzes } from "@/db/schema";
import { db } from "@/db/conn";
import { randomUUID } from "crypto";

async function seed() {
  console.log("🌱 Seeding database...");

  await db.insert(quizzes).values([
    {
      id: randomUUID(),
      userId: "172e46b4-9083-4567-9177-03c349ef78ad",
      title: "Basic Math Quiz",
      description: "Solve basic math problems to test your fundamentals.",
      topic: "Math",
      prompt: "Solve basic math problems",
      difficulty: "easy",
      numQuestions: 10,
      estimatedTime: 15, // in minutes
    },
    {
      id: randomUUID(),
      userId: "172e46b4-9083-4567-9177-03c349ef78ad",
      title: "Computer Science Fundamentals",
      description: "Answer questions about algorithms, data structures, and CS basics.",
      topic: "Computer Science",
      prompt: "Answer questions about algorithms and data structures",
      difficulty: "medium",
      numQuestions: 15,
      estimatedTime: 25,
    },
    {
      id: randomUUID(),
      userId: "172e46b4-9083-4567-9177-03c349ef78ad",
      title: "Physics Advanced Quiz",
      description: "Test your knowledge on mechanics, thermodynamics, and physics concepts.",
      topic: "Physics",
      prompt: "Test your knowledge on mechanics and thermodynamics",
      difficulty: "hard",
      numQuestions: 20,
      estimatedTime: 30,
    },
  ]);

  console.log("✅ Seeding completed!");
}

seed().catch((err) => {
  console.error("❌ Error seeding DB:", err);
  process.exit(1);
});
