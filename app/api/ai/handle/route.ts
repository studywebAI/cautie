// Use dynamic imports to prevent flow files from loading at module initialization time
// This ensures the AI initialization only happens when flows are actually called
const flowMap: Record<string, () => Promise<Function>> = {
  suggestAnswers: () => import("@/ai/flows/suggest-answers").then(m => m.suggestAnswers),
  provideAiPoweredAnalyticsTeacher: () => import("@/ai/flows/provide-ai-powered-analytics-teacher").then(m => m.provideAiPoweredAnalyticsTeacher),
  provideAiPoweredAnalyticsStudent: () => import("@/ai/flows/provide-ai-powered-analytics-student").then(m => m.provideAiPoweredAnalytics),
  processMaterial: () => import("@/ai/flows/process-material").then(m => m.processMaterial),
  generateTeacherDashboardData: () => import("@/ai/flows/generate-teacher-dashboard-data").then(m => m.generateTeacherDashboardData),
  generateStudyPlanFromTask: () => import("@/ai/flows/generate-study-plan-from-task").then(m => m.generateStudyPlanFromTask),
  generateSingleQuestion: () => import("@/ai/flows/generate-single-question").then(m => m.generateSingleQuestion),
  generateSingleFlashcard: () => import("@/ai/flows/generate-single-flashcard").then(m => m.generateSingleFlashcard),
  generateQuiz: () => import("@/ai/flows/generate-quiz").then(m => m.generateQuiz),
  generateQuizDuelData: () => import("@/ai/flows/generate-quiz-duel-data").then(m => m.generateQuizDuelData),
  generatePersonalizedStudyPlan: () => import("@/ai/flows/generate-personalized-study-plan").then(m => m.generatePersonalizedStudyPlan),
  generateNotes: () => import("@/ai/flows/generate-notes").then(m => m.generateNotes),
  generateMultipleChoiceFromFlashcard: () => import("@/ai/flows/generate-multiple-choice-from-flashcard").then(m => m.generateMultipleChoiceFromFlashcard),
  generateKnowledgeGraph: () => import("@/ai/flows/generate-knowledge-graph").then(m => m.generateKnowledgeGraph),
  generateFlashcards: () => import("@/ai/flows/generate-flashcards").then(m => m.generateFlashcards),
  generateClassIdeas: () => import("@/ai/flows/generate-class-ideas").then(m => m.generateClassIdeas),
  explainAnswer: () => import("@/ai/flows/explain-answer").then(m => m.explainAnswer),
};

export async function POST(req: Request) {
  try {
    const { flowName, input } = await req.json();

    if (!flowName || typeof flowName !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid flowName' }), { status: 400 });
    }

    const flowLoader = flowMap[flowName];

    if (!flowLoader) {
      return new Response(JSON.stringify({ error: `Flow with name ${flowName} not found` }), { status: 404 });
    }

    // Dynamically load the flow function - this prevents module-level initialization
    const flowFunction = await flowLoader();
    const result = await flowFunction(input);
    return Response.json(result);
  } catch (error: any) {
    // Better error handling - ensure we always return a valid error message
    const errorMessage = error?.message || error?.toString() || 'An unknown error occurred';
    console.error('AI flow error:', error);
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: error?.stack })
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
