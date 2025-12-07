import { suggestAnswers } from "@/ai/flows/suggest-answers";
import { provideAiPoweredAnalyticsTeacher } from "@/ai/flows/provide-ai-powered-analytics-teacher";
import { provideAiPoweredAnalytics } from "@/ai/flows/provide-ai-powered-analytics-student";
import { processMaterial } from "@/ai/flows/process-material";
import { generateTeacherDashboardData } from "@/ai/flows/generate-teacher-dashboard-data";
import { generateStudyPlanFromTask } from "@/ai/flows/generate-study-plan-from-task";
import { generateSingleQuestion } from "@/ai/flows/generate-single-question";
import { generateSingleFlashcard } from "@/ai/flows/generate-single-flashcard";
import { generateQuiz } from "@/ai/flows/generate-quiz";
import { generateQuizDuelData } from "@/ai/flows/generate-quiz-duel-data";
import { generatePersonalizedStudyPlan } from "@/ai/flows/generate-personalized-study-plan";
import { generateNotes } from "@/ai/flows/generate-notes";
import { generateMultipleChoiceFromFlashcard } from "@/ai/flows/generate-multiple-choice-from-flashcard";
import { generateKnowledgeGraph } from "@/ai/flows/generate-knowledge-graph";
import { generateFlashcards } from "@/ai/flows/generate-flashcards";
import { generateClassIdeas } from "@/ai/flows/generate-class-ideas";
import { explainAnswer } from "@/ai/flows/explain-answer";

const flowMap: Record<string, Function> = {
  suggestAnswers: suggestAnswers,
  provideAiPoweredAnalyticsTeacher: provideAiPoweredAnalyticsTeacher,
  provideAiPoweredAnalyticsStudent: provideAiPoweredAnalytics,
  processMaterial: processMaterial,
  generateTeacherDashboardData: generateTeacherDashboardData,
  generateStudyPlanFromTask: generateStudyPlanFromTask,
  generateSingleQuestion: generateSingleQuestion,
  generateSingleFlashcard: generateSingleFlashcard,
  generateQuiz: generateQuiz,
  generateQuizDuelData: generateQuizDuelData,
  generatePersonalizedStudyPlan: generatePersonalizedStudyPlan,
  generateNotes: generateNotes,
  generateMultipleChoiceFromFlashcard: generateMultipleChoiceFromFlashcard,
  generateKnowledgeGraph: generateKnowledgeGraph,
  generateFlashcards: generateFlashcards,
  generateClassIdeas: generateClassIdeas,
  explainAnswer: explainAnswer,
};

export async function POST(req: Request) {
  try {
    const { flowName, input } = await req.json();

    if (!flowName || typeof flowName !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid flowName' }), { status: 400 });
    }

    const flowFunction = flowMap[flowName];

    if (!flowFunction) {
      return new Response(JSON.stringify({ error: `Flow with name ${flowName} not found` }), { status: 404 });
    }

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
