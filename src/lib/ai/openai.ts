import { AzureOpenAI } from "openai";

function getClient() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;

  if (!endpoint || !apiKey) {
    throw new Error(
      "Missing Azure AI Foundry credentials. Set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY.",
    );
  }

  return new AzureOpenAI({
    endpoint,
    apiKey,
    apiVersion: "2024-12-01-preview",
  });
}

export interface FileMetadataResult {
  summary: string;
  topics: string[];
  difficultyScore: number;
  estimatedMinutes: number;
}

export async function generateFileMetadata(
  textContent: string,
): Promise<FileMetadataResult> {
  const client = getClient();
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

  if (!deployment) {
    throw new Error("Missing AZURE_OPENAI_DEPLOYMENT environment variable.");
  }

  const truncated = textContent.slice(0, 15000);

  const response = await client.chat.completions.create({
    model: deployment,
    messages: [
      {
        role: "system",
        content:
          "You are a helpful study assistant. Extract structured metadata from uploaded study material. " +
          "If the text is too short, corrupted, or unreadable, clearly state that. " +
          "Respond ONLY with valid JSON.",
      },
      {
        role: "user",
        content: `Analyze this study material and return JSON with: summary (concise paragraph), topics (array of key topics), difficultyScore (1-10), estimatedMinutes (total study time estimate). If content is insufficient, set summary to explain why and difficultyScore to 0.

Content:
${truncated}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(raw);

  return {
    summary: parsed.summary || "Could not generate summary.",
    topics: Array.isArray(parsed.topics) ? parsed.topics : [],
    difficultyScore: typeof parsed.difficultyScore === "number" ? parsed.difficultyScore : 0,
    estimatedMinutes: typeof parsed.estimatedMinutes === "number" ? parsed.estimatedMinutes : 0,
  };
}

export function chunkText(text: string, maxChunkLength = 4000): string[] {
  const chunks: string[] = [];
  let current = "";

  const sentences = text.split(/(?<=[.!?])\s+/);

  for (const sentence of sentences) {
    if (current.length + sentence.length > maxChunkLength) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += " " + sentence;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

export interface QuizQuestionResult {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  sourceExcerpt?: string;
  topic: string;
}

export async function generateQuizQuestions(
  textContent: string,
  topics: string[],
  questionCount = 5,
): Promise<QuizQuestionResult[]> {
  const client = getClient();
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

  if (!deployment) {
    throw new Error("Missing AZURE_OPENAI_DEPLOYMENT environment variable.");
  }

  const truncated = textContent.slice(0, 12000);
  const topicsStr = topics.slice(0, 8).join(", ");

  const response = await client.chat.completions.create({
    model: deployment,
    messages: [
      {
        role: "system",
        content:
          "You are a precise quiz generator. Create multiple-choice questions that are answerable ONLY from the provided study material. " +
          "Each question must have exactly 4 options (A, B, C, D). " +
          "If there is not enough content for a question, omit it rather than inventing. " +
          "Respond ONLY with valid JSON.",
      },
      {
        role: "user",
        content: `Generate ${questionCount} multiple-choice quiz questions from this material. Use these topics when relevant: ${topicsStr}.

Return JSON with: questions (array of { question, options (array of 4 strings), correctAnswer (exact string matching one option), explanation (short), sourceExcerpt (short exact excerpt from the content that supports the answer), topic (which topic this covers) }).

Content:
${truncated}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed.questions)) {
    return [];
  }

  return parsed.questions
    .filter(
      (q: unknown) =>
        q &&
        typeof (q as QuizQuestionResult).question === "string" &&
        Array.isArray((q as QuizQuestionResult).options) &&
        (q as QuizQuestionResult).options.length === 4 &&
        typeof (q as QuizQuestionResult).correctAnswer === "string" &&
        typeof (q as QuizQuestionResult).explanation === "string",
    )
    .map((q: QuizQuestionResult) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      sourceExcerpt: q.sourceExcerpt,
      topic: q.topic || "General",
    }));
}

export interface FlashcardResult {
  front: string;
  back: string;
  topic: string;
}

export async function generateFlashcards(
  textContent: string,
  topics: string[],
  cardCount = 8,
): Promise<FlashcardResult[]> {
  const client = getClient();
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

  if (!deployment) {
    throw new Error("Missing AZURE_OPENAI_DEPLOYMENT environment variable.");
  }

  const truncated = textContent.slice(0, 12000);
  const topicsStr = topics.slice(0, 8).join(", ");

  const response = await client.chat.completions.create({
    model: deployment,
    messages: [
      {
        role: "system",
        content:
          "You are a flashcard generator. Create concise question-and-answer flashcards from the provided study material. " +
          "Each flashcard should test a single concept, definition, or fact. " +
          "If there is not enough content, omit cards rather than inventing. " +
          "Respond ONLY with valid JSON.",
      },
      {
        role: "user",
        content: `Generate ${cardCount} flashcards from this material. Use these topics when relevant: ${topicsStr}.

Return JSON with: flashcards (array of { front (question/prompt), back (answer), topic }).

Content:
${truncated}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed.flashcards)) {
    return [];
  }

  return parsed.flashcards
    .filter(
      (f: unknown) =>
        f &&
        typeof (f as FlashcardResult).front === "string" &&
        typeof (f as FlashcardResult).back === "string",
    )
    .map((f: FlashcardResult) => ({
      front: f.front,
      back: f.back,
      topic: f.topic || "General",
    }));
}
