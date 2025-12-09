// app/api/ai/handle/route.ts

// Safe lazy dynamic-loader definitions:
const flowMap: Record<
  string,
  () => Promise<(input: any) => Promise<any> | any>
> = {
  suggestAnswers: () =>
    import("@/ai/flows/suggest-answers").then(m => m.suggestAnswers ?? m.default),

  provideAiPoweredAnalyticsTeacher: () =>
    import("@/ai/flows/provide-ai-powered-analytics-teacher")
      .then(m => m.provideAiPoweredAnalyticsTeacher ?? m.default),

  provideAiPoweredAnalyticsStudent: () =>
    import("@/ai/flows/provide-ai-powered-analytics-student")
      .then(m => m.provideAiPoweredAnalyticsStudent ?? m.default),

  processMaterial: () =>
    import("@/ai/flows/process-material").then(m => m.processMaterial ?? m.default),

  generateTeacherDashboardData: () =>
    import("@/ai/flows/generate-teacher-dashboard-data")
      .then(m => m.generateTeacherDashboardData ?? m.default),

  generateStudyPlanFromTask: () =>
    import("@/ai/flows/generate-study-plan-from-task")
      .then(m => m.generateStudyPlanFromTask ?? m.default),

  generateSingleQuestion: () =>
    import("@/ai/flows/generate-single-question")
      .then(m => m.generateSingleQuestion ?? m.default),

  generateSingleFlashcard: () =>
    import("@/ai/flows/generate-single-flashcard")
      .then(m => m.generateSingleFlashcard ?? m.default),

  generateQuiz: () =>
    import("@/ai/flows/generate-quiz").then(m => m.generateQuiz ?? m.default),

  generateQuizDuelData: () =>
    import("@/ai/flows/generate-quiz-duel-data")
      .then(m => m.generateQuizDuelData ?? m.default),

  generatePersonalizedStudyPlan: () =>
    import("@/ai/flows/generate-personalized-study-plan")
      .then(m => m.generatePersonalizedStudyPlan ?? m.default),

  generateNotes: () =>
    import("@/ai/flows/generate-notes").then(m => m.generateNotes ?? m.default),

  generateMultipleChoiceFromFlashcard: () =>
    import("@/ai/flows/generate-multiple-choice-from-flashcard")
      .then(m => m.generateMultipleChoiceFromFlashcard ?? m.default),

  generateKnowledgeGraph: () =>
    import("@/ai/flows/generate-knowledge-graph")
      .then(m => m.generateKnowledgeGraph ?? m.default),

  generateFlashcards: () =>
    import("@/ai/flows/generate-flashcards").then(m => m.generateFlashcards ?? m.default),

  generateClassIdeas: () =>
    import("@/ai/flows/generate-class-ideas").then(m => m.generateClassIdeas ?? m.default),

  explainAnswer: () =>
    import("@/ai/flows/explain-answer").then(m => m.explainAnswer ?? m.default),
};

export async function POST(req: Request) {
  try {
    const { flowName, input } = await req.json();

    if (!flowName || typeof flowName !== "string") {
      return Response.json({ error: "Missing or invalid flowName" }, { status: 400 });
    }

    const loader = flowMap[flowName];

    if (!loader) {
      return Response.json({ error: `Flow '${flowName}' not found` }, { status: 404 });
    }

    let flow;
    try {
      flow = await loader();
    } catch (err: any) {
      console.error("Flow import failed:", err);
      return Response.json(
        { error: "Failed to import flow", detail: err?.message },
        { status: 500 }
      );
    }

    if (typeof flow !== "function") {
      return Response.json(
        { error: "Imported flow is not a function" },
        { status: 500 }
      );
    }

    try {
      const result = await flow(input);
      return Response.json(result);
    } catch (err: any) {
      console.error("Flow execution error:", err);
      return Response.json(
        {
          error: err?.message || "Flow execution failed",
          ...(process.env.NODE_ENV === "development" && { stack: err?.stack }),
        },
        { status: 500 }
      );
    }
  } catch (err: any) {
    return Response.json(
      {
        error: err?.message || "Unknown server error",
        ...(process.env.NODE_ENV === "development" && { stack: err?.stack }),
      },
      { status: 500 }
    );
  }
}
