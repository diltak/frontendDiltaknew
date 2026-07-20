// app/api/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import axios from 'axios';
import type { ChatMessage } from '@/types/index';
import { getPersonalHistory, formatPersonalHistoryForAI } from '@/lib/reports-service';
import ServerAddress from '@/constent/ServerAddress';

// File processing utilities
interface FileAttachment {
  type: 'image' | 'document';
  name: string;
  content: string; // base64 for images, text content for documents
  mimeType: string;
  size: number;
}

// Supported file types
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const SUPPORTED_DOCUMENT_TYPES = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// File processing functions
async function processImageFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return `data:${file.type};base64,${base64}`;
}

async function processDocumentFile(file: File): Promise<string> {
  if (file.type === 'text/plain') {
    return await file.text();
  }

  if (file.type === 'application/pdf') {
    // For PDF processing, we'll need a PDF parser
    // For now, return a placeholder - in production, use pdf-parse or similar
    return `[PDF Document: ${file.name}] - PDF text extraction not implemented yet. Please describe the content or convert to text format.`;
  }

  if (file.type.includes('word')) {
    // For Word documents, we'll need a Word parser
    // For now, return a placeholder - in production, use mammoth or similar
    return `[Word Document: ${file.name}] - Word document text extraction not implemented yet. Please describe the content or convert to text format.`;
  }

  return `[Document: ${file.name}] - Unsupported document type for text extraction.`;
}

async function validateAndProcessFile(file: File): Promise<FileAttachment | null> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }

  // Validate file type
  const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type);
  const isDocument = SUPPORTED_DOCUMENT_TYPES.includes(file.type);

  if (!isImage && !isDocument) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }

  try {
    let content: string;
    let type: 'image' | 'document';

    if (isImage) {
      content = await processImageFile(file);
      type = 'image';
    } else {
      content = await processDocumentFile(file);
      type = 'document';
    }

    return {
      type,
      name: file.name,
      content,
      mimeType: file.type,
      size: file.size
    };
  } catch (error) {
    console.error('Error processing file:', error);
    throw new Error(`Failed to process file: ${file.name}`);
  }
}

// Psychological Assessment Data
const ASSESSMENT_DATA = {
  personality_profiler: {
    questions: {
      1: "Does your mood fluctuate?",
      2: "Do you bother too much about what others think of you?",
      3: "Do you like talking much?",
      4: "If you make a commitment to someone, do you abide by it irrespective of discomfort?",
      5: "Do you sometimes feel under the weather?",
      6: "If you become broke/bankrupt will it bother you?",
      7: "Are you a happy go lucky person?",
      8: "Do you desire for more than the effort you put in for anything?",
      9: "Do you get anxious easily?",
      10: "Are you curious to try drugs that may be dangerous otherwise?",
      11: "Do you like making new friends?",
      12: "Have you put blame on someone for your own mistake?",
      13: "Are you a sensitive person?",
      14: "Do you prefer having your own way out rather than following a code of conduct?",
      15: "Do you like partying?",
      16: "Are you well behaved and good mannered?",
      17: "Do you often feel offended for no reason?",
      18: "Do you like abiding by rules and remaining neat and clean?",
      19: "Do you like approaching new people?",
      20: "Have you ever stolen anything?",
      21: "Do you get anxious easily?",
      22: "Do you think getting married is futile?",
      23: "Can you bring life to a boring party?",
      24: "Have you ever broken or misplaced something that did not belong to you?",
      25: "Do you overthink and worry a lot?",
      26: "Do you like working in teams?",
      27: "Do you like to take a back seat during social events?",
      28: "Does it keep bothering you if the work you have does is incorrect or has errors?",
      29: "Have you ever backbitten about someone?",
      30: "Are you a high on nerves person?",
      31: "Do you think people expend a lot of time in making future investments?",
      32: "Do you like spending time with people?",
      33: "Were you difficult to handle as a child to your parents?",
      34: "Does an awkward experience keep bothering you even after it is over?",
      35: "Do you try to be polite to people?",
      36: "Do you like a lot of hustle and bustle around you?",
      37: "Have you ever broken rules during any game/sport?",
      38: "Do you suffer from overthinking and nervousness?",
      39: "Do you like to dominate others?",
      40: "Have you ever misused someone's decency?",
      41: "Do you interact less, when with other people?",
      42: "Do you mostly feel alone?",
      43: "Do you prefer following rules set by the society or be a master of you wishes?",
      44: "Are you considered to be an upbeat person by others?",
      45: "Do you follow what you say?",
      46: "Do you often feel embarrassed and guilty?",
      47: "Do you sometimes procrastinate?",
      48: "Can you initiate and bring life to a party?"
    },
    scoring: {
      "Non-Conformist": { "yes": [10, 14, 22, 31, 39], "no": [2, 6, 18, 26, 28, 35, 43] },
      "Sociable": { "yes": [3, 7, 11, 15, 19, 23, 32, 36, 44, 48], "no": [27, 41] },
      "Emotionally Unstable": { "yes": [1, 5, 9, 13, 17, 21, 25, 30, 34, 38, 42, 46], "no": [] },
      "Socially Desirable": { "yes": [4, 16], "no": [8, 12, 20, 24, 29, 33, 37, 40, 45, 47] }
    },
    interpretations: {
      "Sociable": "High scores indicate an outgoing, impulsive, and uninhibited personality. These individuals enjoy social gatherings, have many friends, and prefer excitement and activity.",
      "Unsociable": "Low scores on Sociable dimensions suggest a quiet, retiring, and studious nature. They tend to be reserved, prefer a well-planned life, and keep feelings controlled.",
      "Emotionally Unstable": "High scores indicate strong emotional lability and over-responsiveness. They tend to experience worries and anxieties, especially under stress.",
      "Non-Conformist": "High scores suggest tendencies towards being cruel, inhumane, socially indifferent, hostile, and aggressive. They may lack empathy and act disruptively.",
      "Socially Desirable": "This scale measures the tendency to 'fake good' or provide socially acceptable answers rather than true ones. A high score may indicate the other results are not fully valid."
    }
  },
  self_efficacy_scale: {
    questions: [
      "I can solve tedious problems with sincere efforts.",
      "If someone disagrees with me, I can still manage to get what I want with ease.",
      "It is easy for me to remain focused on my objectives and achieve my goals.",
      "I have the caliber of dealing efficiently and promptly with obstacles and adversities.",
      "I am resourceful and competent enough to handle unpredictable events and situations.",
      "I can solve problems with ease if I put in requisite effort.",
      "I can remain relaxed even in wake of adversity due to my coping skills.",
      "I can generate alternative solutions with ease even when I come across problematic situations.",
      "If I find myself in a catch twenty two situation, I can still manage finding a solution.",
      "I am mostly capable of handling anything that crosses my path."
    ],
    scoring_instructions: "Please rate each statement on a scale of 1 to 4, where 1 is 'Not at all true', 2 is 'Hardly true', 3 is 'Moderately true', and 4 is 'Exactly true'.",
    interpretation: "The total score will be the sum of your ratings for all 10 items (ranging from 10-40). A higher score indicates higher Self-Efficacy. High self-efficacy is a belief in one's own ability to meet challenges and complete tasks successfully. It is associated with self-confidence, willingness to take risks, resilience, and strong motivation."
  }
};

interface UmaChatResponse {
  session_id: string;
  reply: string;
  peek: {
    language: string;
    emotion: string;
    emotion_intensity: number;
    tone_shift: string;
    subtext: string;
    deep_need: string;
    conversation_phase: string;
  };
  mesh: {
    new_memories: string[];
    recalled_memories: string[];
  };
  strategy: string;
  expression_style: string;
  retrieved_context: string[];
  total_memories: number;
}

async function callUmaChat(message: string, sessionId?: string): Promise<UmaChatResponse> {
  try {
    const response = await axios.post(`${ServerAddress}/chat`, {
      message,
      session_id: sessionId || null,
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    return response.data;
  } catch (error: any) {
    const status = error.response?.status;
    const errorData = error.response?.data;
    console.error('Uma API error:', status, errorData);
    throw new Error(`Uma API error: ${status || 'Unknown'} - ${JSON.stringify(errorData) || error.message}`);
  }
}

interface WellnessReport {
  mood: number;
  stress_score: number;
  anxious_level: number;
  work_satisfaction: number;
  work_life_balance: number;
  energy_level: number;
  confident_level: number;
  sleep_quality: number;
  complete_report: string;
  session_type: 'text' | 'voice';
  session_duration: number;
  key_insights: string[];
  recommendations: string[];
  metrics?: {
    emotional_tone: number;
    stress_anxiety: number;
    motivation_engagement: number;
    social_connectedness: number;
    self_esteem: number;
    assertiveness: number;
    work_life_balance_metric: number;
    cognitive_functioning: number;
    emotional_regulation: number;
    substance_use: number;
  };
  metrics_explanation?: {
    emotional_tone: string;
    stress_anxiety: string;
    motivation_engagement: string;
    social_connectedness: string;
    self_esteem: string;
    assertiveness: string;
    work_life_balance_metric: string;
    cognitive_functioning: string;
    emotional_regulation: string;
    substance_use: string;
  };
  physical_health_metrics?: {
    physical_activity: {
      exercise_frequency: number;
      exercise_type: string;
      daily_sitting_hours: number;
      stretch_breaks: boolean;
    };
    nutrition_hydration: {
      meals_per_day: number;
      water_intake_liters: number;
      fruit_veg_intake: 'adequate' | 'inadequate';
      skips_meals: boolean;
    };
    pain_discomfort: {
      back_pain: 'none' | 'occasional' | 'frequent';
      neck_shoulder_pain: 'none' | 'occasional' | 'frequent';
      wrist_hand_pain: 'none' | 'occasional' | 'frequent';
      eye_strain: 'none' | 'occasional' | 'frequent';
      headaches_frequency: 'none' | 'occasional' | 'frequent';
    };
    lifestyle_risks: {
      smoking_status: 'non_smoker' | 'occasional' | 'regular';
      alcohol_frequency: 'never' | 'occasionally' | 'regularly';
      caffeine_dependence: boolean;
    };
    ergonomics: {
      chair_comfort: 'excellent' | 'good' | 'fair' | 'poor';
      screen_alignment: boolean;
      work_break_frequency: 'frequent' | 'regular' | 'rare';
      work_mode: 'office' | 'wfh' | 'hybrid';
    };
    absenteeism: {
      sick_days_last_3_months: number;
      health_affects_productivity: boolean;
    };
  };
}

// Assessment Functions
function getAssessmentQuestions(testName: string): string {
  const normalizedTestName = testName.toLowerCase().replace(/\s+/g, '_');

  if (!(normalizedTestName in ASSESSMENT_DATA)) {
    return `Assessment '${testName}' not found. Available assessments are: ${Object.keys(ASSESSMENT_DATA).map(k => k.replace('_', ' ')).join(', ')}`;
  }

  const test = ASSESSMENT_DATA[normalizedTestName as keyof typeof ASSESSMENT_DATA];
  let output = `Great! Here are the questions for the ${testName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}.\n\n`;

  if ('scoring_instructions' in test) {
    output += test.scoring_instructions + "\n\n";
  }

  if (normalizedTestName === 'personality_profiler') {
    output += "Please answer 'yes' or 'no' to each question:\n\n";
    const questions = test.questions as Record<number, string>;
    for (const [num, question] of Object.entries(questions)) {
      output += `${num}. ${question}\n`;
    }
  } else if (normalizedTestName === 'self_efficacy_scale') {
    const questions = test.questions as string[];
    questions.forEach((question, index) => {
      output += `${index + 1}. ${question}\n`;
    });
  }

  output += "\nPlease take your time to answer and then provide your responses when you're ready for interpretation.";
  return output;
}

function interpretPersonalityProfiler(answers: Record<string, string>): string {
  const scores = {
    "Non-Conformist": 0,
    "Sociable": 0,
    "Emotionally Unstable": 0,
    "Socially Desirable": 0
  };

  const scoringRules = ASSESSMENT_DATA.personality_profiler.scoring;

  for (const [dimension, rules] of Object.entries(scoringRules)) {
    let score = 0;

    // Count "yes" answers
    for (const qNum of rules.yes || []) {
      if (answers[qNum.toString()]?.toLowerCase() === 'yes') {
        score += 1;
      }
    }

    // Count "no" answers
    for (const qNum of rules.no || []) {
      if (answers[qNum.toString()]?.toLowerCase() === 'no') {
        score += 1;
      }
    }

    scores[dimension as keyof typeof scores] = score;
  }

  const interpretations = ASSESSMENT_DATA.personality_profiler.interpretations;
  let result = "Based on your answers, here is your personality profile:\n\n";

  for (const [dimension, score] of Object.entries(scores)) {
    result += `**${dimension} Score: ${score}**\n`;

    if (dimension === "Sociable") {
      const interp = score > 5 ? interpretations.Sociable : interpretations.Unsociable;
      result += `Interpretation: ${interp}\n\n`;
    } else if (dimension in interpretations) {
      result += `Interpretation: ${interpretations[dimension as keyof typeof interpretations]}\n\n`;
    }
  }

  return result;
}

function interpretSelfEfficacyScale(scores: number[]): string {
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  const maxScore = 40;
  const minScore = 10;

  let interpretation = `Your Self-Efficacy Scale Results:\n\n`;
  interpretation += `Total Score: ${totalScore} out of ${maxScore}\n\n`;

  if (totalScore >= 32) {
    interpretation += "**High Self-Efficacy**: You have strong confidence in your ability to handle challenges and achieve your goals. You likely approach difficult tasks as challenges to master rather than threats to avoid.";
  } else if (totalScore >= 24) {
    interpretation += "**Moderate Self-Efficacy**: You have reasonable confidence in your abilities, though there may be some areas where you could develop stronger self-belief. You generally handle challenges well but might sometimes doubt yourself.";
  } else {
    interpretation += "**Lower Self-Efficacy**: You may benefit from building more confidence in your abilities. Consider focusing on past successes and developing coping strategies to handle challenges more effectively.";
  }

  interpretation += `\n\n${ASSESSMENT_DATA.self_efficacy_scale.interpretation}`;

  return interpretation;
}

export async function POST(request: NextRequest) {
  try {
    // Check if this is a multipart form data request (file upload)
    const contentType = request.headers.get('content-type') || '';
    let requestData: any;
    let files: FileAttachment[] = [];

    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();

      // Extract JSON data
      const jsonData = formData.get('data') as string;
      if (jsonData) {
        requestData = JSON.parse(jsonData);
      } else {
        throw new Error('Missing data in form submission');
      }

      // Process uploaded files
      const uploadedFiles = formData.getAll('files') as File[];
      for (const file of uploadedFiles) {
        try {
          const processedFile = await validateAndProcessFile(file);
          if (processedFile) {
            files.push(processedFile);
          }
        } catch (error: any) {
          console.error('File processing error:', error);
          return NextResponse.json(
            { error: `File processing failed: ${error.message}` },
            { status: 400 }
          );
        }
      }
    } else {
      // Handle regular JSON request
      requestData = await request.json();
    }

    const {
      messages,
      endSession,
      sessionType = 'text',
      sessionDuration = 0,
      userId,
      companyId,
      deepSearch = false,
      aiProvider = 'openai', // 'openai' or 'perplexity'
      assessmentType,
      assessmentAnswers,
      umaSessionId,
      firebaseToken,
    } = requestData;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Handle assessment requests
    if (assessmentType === 'get_questions') {
      const lastMessage = messages[messages.length - 1];
      const testName = extractTestName(lastMessage.content);
      if (testName) {
        const questions = getAssessmentQuestions(testName);
        return NextResponse.json({
          type: 'assessment_questions',
          data: {
            content: questions,
            sender: 'ai',
            testName: testName
          }
        });
      }
    }

    if (assessmentType === 'interpret_results' && assessmentAnswers) {
      const { testName, answers } = assessmentAnswers;
      let interpretation = '';

      if (testName === 'personality_profiler') {
        interpretation = interpretPersonalityProfiler(answers);
      } else if (testName === 'self_efficacy_scale') {
        interpretation = interpretSelfEfficacyScale(answers);
      }

      return NextResponse.json({
        type: 'assessment_results',
        data: {
          content: interpretation,
          sender: 'ai',
          testName: testName
        }
      });
    }

    if (endSession) {
      return await generateWellnessReport(messages, sessionType, sessionDuration, userId, companyId, firebaseToken);
    } else {
      return await generateChatResponse(messages, sessionType, userId, companyId, deepSearch, aiProvider, files, umaSessionId);
    }

  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to extract test name from user message
function extractTestName(message: string): string | null {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('personality') || lowerMessage.includes('profiler')) {
    return 'personality_profiler';
  }

  if (lowerMessage.includes('self efficacy') || lowerMessage.includes('self-efficacy') || lowerMessage.includes('efficacy')) {
    return 'self_efficacy_scale';
  }

  return null;
}

// Helper function to parse personality profiler answers
function parsePersonalityAnswers(message: string): Record<string, string> | null {
  const answers: Record<string, string> = {};

  // Try to parse numbered yes/no answers
  const lines = message.split('\n');
  for (const line of lines) {
    const match = line.match(/(\d+)[\.\)]\s*(yes|no)/i);
    if (match) {
      answers[match[1]] = match[2].toLowerCase();
    }
  }

  // Alternative parsing for different formats
  if (Object.keys(answers).length === 0) {
    const yesNoPattern = /(yes|no)/gi;
    const matches = message.match(yesNoPattern);
    if (matches && matches.length >= 10) { // At least some answers
      matches.forEach((answer, index) => {
        answers[(index + 1).toString()] = answer.toLowerCase();
      });
    }
  }

  return Object.keys(answers).length > 0 ? answers : null;
}

// Helper function to parse self-efficacy scale answers
function parseSelfEfficacyAnswers(message: string): number[] | null {
  const scores: number[] = [];

  // Try to parse numbered ratings (1-4)
  const lines = message.split('\n');
  for (const line of lines) {
    const match = line.match(/(\d+)[\.\)]\s*([1-4])/);
    if (match) {
      scores.push(parseInt(match[2]));
    }
  }

  // Alternative parsing for different formats
  if (scores.length === 0) {
    const numberPattern = /[1-4]/g;
    const matches = message.match(numberPattern);
    if (matches && matches.length >= 5) { // At least some answers
      matches.forEach(score => {
        const num = parseInt(score);
        if (num >= 1 && num <= 4) {
          scores.push(num);
        }
      });
    }
  }

  return scores.length > 0 ? scores : null;
}

async function generateChatResponse(messages: ChatMessage[], _sessionType: string, userId?: string, companyId?: string, _deepSearch: boolean = false, _aiProvider: string = 'openai', files: FileAttachment[] = [], umaSessionId?: string) {
  try {
    const lastUserMessage = messages.filter(m => m.sender === 'user').pop()?.content || '';

    // Build the message to send to Uma
    let messageForUma = lastUserMessage;

    // On the first message of a new session, inject the user's wellness history
    // so Uma can do follow-ups and reference past reports
    const isFirstMessage = !umaSessionId;
    if (isFirstMessage && userId && companyId) {
      try {
        const history = await getPersonalHistory(userId, companyId, 60);
        const historyText = formatPersonalHistoryForAI(history);

        if (historyText && !historyText.includes('first wellness session')) {
          messageForUma = (
            `[CONTEXT — this person's wellness history from previous sessions. ` +
            `Use this to do follow-ups, notice patterns, and track their mental health over time. ` +
            `Reference specific past data naturally, like a friend who remembers. ` +
            `If stress/anxiety/mood are trending badly, gently check in on those areas. ` +
            `If things are improving, acknowledge the progress.]\n\n` +
            `${historyText}\n\n` +
            `---\n\n` +
            `[Their message:] ${lastUserMessage}`
          );
        }
      } catch (historyError) {
        console.error('Failed to fetch wellness history (continuing without it):', historyError);
      }
    }

    // Include file text if attached
    if (files.length > 0) {
      const fileParts: string[] = [];
      for (const file of files) {
        if (file.type === 'document') {
          fileParts.push(`[Attached document "${file.name}"]\n${file.content.substring(0, 3000)}`);
        } else if (file.type === 'image') {
          fileParts.push(`[Attached image: ${file.name}]`);
        }
      }
      if (fileParts.length > 0) {
        messageForUma = `${messageForUma}\n\n${fileParts.join('\n\n')}`;
      }
    }

    const umaResponse = await callUmaChat(messageForUma, umaSessionId);

    const emotionToAvatar: Record<string, string> = {
      'Happy': 'HAPPY',
      'Excited': 'HAPPY',
      'Grateful': 'HAPPY',
      'Sad': 'SAD',
      'Lonely': 'SAD',
      'Angry': 'ANGRY',
      'Anxious': 'THINKING',
      'Confused': 'THINKING',
      'Tired': 'IDLE',
      'Neutral': 'IDLE',
    };

    return NextResponse.json({
      type: 'message',
      data: {
        content: umaResponse.reply,
        sender: 'ai',
        umaSessionId: umaResponse.session_id,
        emotion: umaResponse.peek.emotion,
        avatarEmotion: emotionToAvatar[umaResponse.peek.emotion] || 'IDLE',
        emotionIntensity: umaResponse.peek.emotion_intensity,
        expressionStyle: umaResponse.expression_style,
        conversationPhase: umaResponse.peek.conversation_phase,
      }
    });

  } catch (error: any) {
    console.error('Error generating chat response:', error);
    throw error;
  }
}

async function generateWellnessReport(messages: ChatMessage[], sessionType: string, sessionDuration: number, userId?: string, companyId?: string, firebaseToken?: string): Promise<NextResponse> {
  try {
    // Extract user messages for analysis
    const userMessages = messages
      .filter(msg => msg.sender === 'user')
      .map(msg => msg.content)
      .join('\n');

    const analysisPrompt = `Analyze this ${sessionType} wellness conversation and generate a comprehensive mental health report. The conversation lasted ${Math.floor(sessionDuration / 60)} minutes and ${sessionDuration % 60} seconds.

User's responses:
${userMessages}

Generate a JSON report with the following structure metrics must be available:
{
  "mood": [1-10 scale],
  "stress_score": [1-10 scale, where 10 is highest stress],
  "anxious_level": [1-10 scale],
  "work_satisfaction": [1-10 scale],
  "work_life_balance": [1-10 scale],
  "energy_level": [1-10 scale],
  "confident_level": [1-10 scale],
  "sleep_quality": [1-10 scale],
  "complete_report": "A comprehensive 2-3 paragraph analysis of the user's mental state, key concerns, and overall wellness",
  "session_type": "${sessionType}",
  "session_duration": ${sessionDuration},
  "key_insights": ["3-5 key insights about the user's mental state"],
  "recommendations": ["3-5 specific, actionable recommendations for improving wellness"],
  "metrics": {
    "emotional_tone": 0-3, // 0=positive, 1=neutral, 2=negative, 3=strong negative
    "stress_anxiety": 0-3, // 0=none, 1=neutral, 2=moderate, 3=high risk
    "motivation_engagement": 0-3, // 0=positive, 1=neutral, 2=negative, 3=strong negative
    "social_connectedness": 0-3, // 0=positive, 1=neutral, 2=negative, 3=strong negative
    "self_esteem": 0-3, // 0=positive, 1=neutral, 2=negative, 3=strong negative
    "assertiveness": 0-3, // 0=positive, 1=neutral, 2=negative, 3=strong negative
    "work_life_balance_metric": 0-3, // 0=positive, 1=neutral, 2=negative, 3=strong negative
    "cognitive_functioning": 0-3, // 0=positive, 1=neutral, 2=negative, 3=strong negative
    "emotional_regulation": 0-3, // 0=positive, 1=neutral, 2=negative, 3=strong negative
    "substance_use": 0-3 // 0=no mention, 1=mild, 2=frequent, 3=high risk
  },
  "metrics_explanation": {
    "emotional_tone": "...",
    "stress_anxiety": "...",
    "motivation_engagement": "...",
    "social_connectedness": "...",
    "self_esteem": "...",
    "assertiveness": "...",
    "work_life_balance_metric": "...",
    "cognitive_functioning": "...",
    "emotional_regulation": "...",
    "substance_use": "..."
  },
  "physical_health_metrics": {
    "physical_activity": {
      "exercise_frequency": 0, // times per week (0-7)
      "exercise_type": "none", // e.g., "walking", "running", "gym", "yoga", "none"
      "daily_sitting_hours": 8, // hours per day
      "stretch_breaks": false // boolean
    },
    "nutrition_hydration": {
      "meals_per_day": 3, // number
      "water_intake_liters": 2.0, // liters per day
      "fruit_veg_intake": "adequate", // "adequate" or "inadequate"
      "skips_meals": false // boolean
    },
    "pain_discomfort": {
      "back_pain": "none", // "none", "occasional", "frequent"
      "neck_shoulder_pain": "none", // "none", "occasional", "frequent"
      "wrist_hand_pain": "none", // "none", "occasional", "frequent"
      "eye_strain": "none", // "none", "occasional", "frequent"
      "headaches_frequency": "none" // "none", "occasional", "frequent"
    },
    "lifestyle_risks": {
      "smoking_status": "non_smoker", // "non_smoker", "occasional", "regular"
      "alcohol_frequency": "never", // "never", "occasionally", "regularly"
      "caffeine_dependence": false // boolean
    },
    "ergonomics": {
      "chair_comfort": "good", // "excellent", "good", "fair", "poor"
      "screen_alignment": true, // boolean
      "work_break_frequency": "regular", // "frequent", "regular", "rare"
      "work_mode": "office" // "office", "wfh", "hybrid"
    },
    "absenteeism": {
      "sick_days_last_3_months": 0, // number
      "health_affects_productivity": false // boolean
    }
  }
}

Guidelines:
- For each metric, use the following scoring:
1. Emotional Tone / Affect
  - Positive keywords = 0 points
  - Neutral (okay, fine, alright, doing well) = 1 point
  - Negative keywords = 2 points
  - Strong negative (hopeless, horrible, crap, shit, pissed off) = 3 points
2. Stress & Anxiety Levels
  - Neutral stress words (busy, workload, tense) = 1 point
  - Moderate stress (anxious, jittery, concerned, high strung) = 2 points
  - High risk (panic, can’t cope, burnout, overwhelmed, afraid) = 3 points
3. Motivation & Engagement
  - Positive (motivated, excited, focused, attentive, growth) = 0 points
  - Neutral (regular, consistent, initiative, locked-in) = 1 point
  - Negative (bored, uninterested, distracted, doesn’t matter) = 2 points
  - Strong negative (waste of time, stagnant, demotivated, pointless) = 3 points
4. Social Connectedness / Isolation
  - Positive (supported, connected, included, safe, validated) = 0 points
  - Neutral (heard, relatable, important) = 1 point
  - Negative (lonely, ignored, undervalued, not heard, outsider) = 2 points
  - Strong negative (outcast, dismissed, disconnected, unimportant) = 3 points
5. Self-Esteem & Confidence
  - Positive (capable, confident, skilled, worthy, smart) = 0 points
  - Neutral (approachable, sorted, enough, well liked) = 1 point
  - Negative (insecure, doubtful, weak, awkward, underserving) = 2 points
  - Strong negative (worthless, useless, failure, stupid, good for nothing) = 3 points
6. Assertiveness & Communication Skills
  - Positive (assertive, clear, respectful, constructive, stand up for myself) = 0 points
  - Neutral (diplomatic, open communication) = 1 point
  - Negative (quiet, passive, can’t speak up, insecure, unheard) = 2 points
  - Strong negative (push over, people pleasing, not heard, resentful) = 3 points
7. Work-Life Balance
  - Positive (rest, family time, relaxed, hobbies, healthy routine) = 0 points
  - Neutral (vacation, holidays, chilling, hanging out) = 1 point
  - Negative (exhausted, no time, irregular sleep, stressed, unhealthy) = 2 points
  - Strong negative (burnout, always working, drained, micro management, no social life) = 3 points
8. Cognitive Functioning (Clarity & Focus)
  - Positive (focused, sharp, alert, productive, quick, reliable) = 0 points
  - Neutral (planning, reflect, comprehend, critical, recall) = 1 point
  - Negative (distracted, unclear, inattentive, indecisive, overthink) = 2 points
  - Strong negative (blank, lost, stuck, mental block, foggy) = 3 points
9. Emotional Regulation
  - Positive (calm, stable, mindful, composed, compassionate) = 0 points
  - Neutral (balanced, considerate, humble, centred, self-aware) = 1 point
  - Negative (irritable, reactive, touchy, sensitive, frustrated) = 2 points
  - Strong negative (outburst, unstable, volatile, unpredictable, trust issues) = 3 points
10. Substance Use
  - No mention = 0 points
  - Mild (drinking, smoking, caffeine, energy drinks) = 1 point
  - Frequent (drunk, stoned, cigarettes, pills) = 2 points
  - High risk (addicted, can’t stop, dependence, using to cope) = 3 points
- For each metric, provide a brief explanation in metrics_explanation.
- If information is missing, use reasonable estimates based on available data.
- Be empathetic and constructive in the complete_report.
- Make recommendations specific and actionable.
- Consider the ${sessionType} format in your analysis.
- Focus on patterns and themes in their responses.

PHYSICAL HEALTH METRICS EXTRACTION:
Extract physical health information from the conversation. Look for mentions of:
- Exercise habits (frequency, type, sitting hours, stretch breaks)
- Nutrition (meals per day, water intake, fruit/vegetable consumption, meal skipping)
- Pain/discomfort (back, neck/shoulder, wrist/hand, eye strain, headaches)
- Lifestyle factors (smoking, alcohol, caffeine)
- Ergonomics (chair comfort, screen setup, work breaks, work location)
- Absenteeism (sick days, health impact on productivity)

If the user hasn't explicitly mentioned physical health topics, use reasonable defaults:
- exercise_frequency: 0-3 times/week (estimate based on energy level and lifestyle mentions)
- daily_sitting_hours: 6-10 hours (estimate based on work mode and job type)
- meals_per_day: 2-3 (estimate based on mentions of eating habits)
- water_intake_liters: 1.5-2.5 (reasonable default)
- pain levels: "none" unless mentioned
- smoking_status: "non_smoker" unless mentioned
- alcohol_frequency: "occasionally" or "never" unless mentioned
- work_mode: infer from conversation (office/wfh/hybrid)
- chair_comfort: "good" or "fair" unless mentioned
- sick_days_last_3_months: 0-2 unless mentioned

Always include the physical_health_metrics object in your response, even if using estimates.`;

    // ── Forward to the animeshai backend (has its own AI key) ──────────────────
    // Build a compact conversation summary to send
    const conversationSummary = messages
      .map(m => `${m.sender === 'user' ? 'User' : 'Uma'}: ${m.content}`)
      .join('\n');

    let backendReport: Partial<WellnessReport> = {};
    try {
      const backendHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (firebaseToken) {
        backendHeaders['Authorization'] = `Bearer ${firebaseToken}`;
      }
      const backendRes = await fetch(`${ServerAddress}/api/chat_wrapper`, {
        method: 'POST',
        headers: backendHeaders,
        body: JSON.stringify({
          messages,
          endSession: true,
          sessionType,
          sessionDuration,
          userId: userId ?? 'anonymous',
          companyId: companyId ?? '',
        }),
      });

      if (backendRes.ok) {
        const backendData = await backendRes.json();
        // Backend returns { type: 'report', data: {...} } with different field names
        const raw: any = backendData?.data ?? backendData?.report ?? backendData ?? {};
        // Normalize backend field names to WellnessReport format
        backendReport = {
          mood: raw.mood_rating ?? raw.mood,
          stress_score: raw.stress_level ?? raw.stress_score,
          anxious_level: raw.anxiety_level ?? raw.anxious_level,
          work_satisfaction: raw.work_satisfaction,
          work_life_balance: raw.work_life_balance,
          energy_level: raw.energy_level,
          confident_level: raw.confidence_level ?? raw.confident_level,
          sleep_quality: raw.sleep_quality,
          complete_report: raw.notes ?? raw.complete_report ?? '',
          session_type: (raw.session_type ?? sessionType) as 'text' | 'voice',
          session_duration: raw.session_duration_minutes ?? raw.session_duration ?? sessionDuration,
          key_insights: raw.key_insights ?? [],
          recommendations: raw.recommendations ?? [],
        };
      } else {
        console.warn('animeshai /chat_wrapper returned non-ok status:', backendRes.status);
      }
    } catch (backendErr) {
      console.warn('animeshai backend unavailable for report generation, using fallback:', backendErr);
    }

    let aiResponse = Object.keys(backendReport).length > 0
      ? JSON.stringify(backendReport)
      : null;

    // Fallback: call OpenAI directly if backend is unavailable or failed
    if (!aiResponse) {
      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) {
        throw new Error('No analysis generated from backend and OPENAI_API_KEY is not set');
      }
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a wellness analysis AI. Respond with valid JSON only, no markdown.' },
            { role: 'user', content: analysisPrompt },
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' },
        }),
      });
      if (openaiRes.ok) {
        const openaiData = await openaiRes.json();
        aiResponse = openaiData.choices?.[0]?.message?.content ?? null;
      }
      if (!aiResponse) {
        throw new Error('No analysis generated from backend or OpenAI fallback');
      }
    }


    // Parse the JSON response
    let report: WellnessReport & { metrics?: any; metrics_explanation?: any };
    try {
      report = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', aiResponse);
      // Fallback report if JSON parsing fails
      report = {
        mood: 5,
        stress_score: 5,
        anxious_level: 5,
        work_satisfaction: 5,
        work_life_balance: 5,
        energy_level: 5,
        confident_level: 5,
        sleep_quality: 5,
        complete_report: "Unable to generate detailed analysis due to processing error. Please try again or contact support.",
        session_type: sessionType as 'text' | 'voice',
        session_duration: sessionDuration,
        key_insights: ["Analysis temporarily unavailable"],
        recommendations: ["Please try another session for detailed recommendations"],
        metrics: {
          emotional_tone: 1,
          stress_anxiety: 1,
          motivation_engagement: 1,
          social_connectedness: 1,
          self_esteem: 1,
          assertiveness: 1,
          work_life_balance_metric: 1,
          cognitive_functioning: 1,
          emotional_regulation: 1,
          substance_use: 1
        },
        metrics_explanation: {
          emotional_tone: "Neutral baseline due to parsing fallback.",
          stress_anxiety: "Neutral baseline due to parsing fallback.",
          motivation_engagement: "Neutral baseline due to parsing fallback.",
          social_connectedness: "Neutral baseline due to parsing fallback.",
          self_esteem: "Neutral baseline due to parsing fallback.",
          assertiveness: "Neutral baseline due to parsing fallback.",
          work_life_balance_metric: "Neutral baseline due to parsing fallback.",
          cognitive_functioning: "Neutral baseline due to parsing fallback.",
          emotional_regulation: "Neutral baseline due to parsing fallback.",
          substance_use: "Neutral baseline due to parsing fallback."
        }
      };
    }

    // Enforce metrics presence: ensure all required metrics exist with sane defaults (0-3)
    const metricKeys = [
      'emotional_tone',
      'stress_anxiety',
      'motivation_engagement',
      'social_connectedness',
      'self_esteem',
      'assertiveness',
      'work_life_balance_metric',
      'cognitive_functioning',
      'emotional_regulation',
      'substance_use'
    ] as const;

    if (!report.metrics || typeof report.metrics !== 'object') {
      report.metrics = {};
    }
    if (!report.metrics_explanation || typeof report.metrics_explanation !== 'object') {
      report.metrics_explanation = {};
    }

    for (const key of metricKeys) {
      const rawValue = (report.metrics as any)[key];
      let valueNum = typeof rawValue === 'number' ? rawValue : parseInt(String(rawValue));
      if (Number.isNaN(valueNum)) valueNum = 1; // default neutral
      // clamp to [0,3]
      valueNum = Math.max(0, Math.min(3, valueNum));
      (report.metrics as any)[key] = valueNum;

      if (!report.metrics_explanation[key]) {
        (report.metrics_explanation as any)[key] = 'Derived default or not explicitly mentioned in chat.';
      }
    }

    // Ensure physical_health_metrics exists with defaults if missing
    if (!report.physical_health_metrics || typeof report.physical_health_metrics !== 'object') {
      report.physical_health_metrics = {
        physical_activity: {
          exercise_frequency: 2,
          exercise_type: 'walking',
          daily_sitting_hours: 8,
          stretch_breaks: false
        },
        nutrition_hydration: {
          meals_per_day: 2,
          water_intake_liters: 1.8,
          fruit_veg_intake: 'inadequate',
          skips_meals: true
        },
        pain_discomfort: {
          back_pain: 'none',
          neck_shoulder_pain: 'none',
          wrist_hand_pain: 'none',
          eye_strain: 'none',
          headaches_frequency: 'none'
        },
        lifestyle_risks: {
          smoking_status: 'non_smoker',
          alcohol_frequency: 'occasionally',
          caffeine_dependence: false
        },
        ergonomics: {
          chair_comfort: 'good',
          screen_alignment: true,
          work_break_frequency: 'regular',
          work_mode: 'wfh'
        },
        absenteeism: {
          sick_days_last_3_months: 0,
          health_affects_productivity: false
        }
      };
    }

    // Save to Firestore if userId and companyId are present
    if (userId && companyId) {
      // Map AI report to legacy fields for compatibility
      const mood_rating = report.mood;
      const stress_level = report.stress_score;
      const anxiety_level = report.anxious_level;
      const work_satisfaction = report.work_satisfaction;
      const work_life_balance_score = report.work_life_balance;
      const energy_level = report.energy_level;
      const confidence_level = report.confident_level;
      const sleep_quality = report.sleep_quality;

      // Compute overall wellness: average of positive indicators and inverted negatives
      const positiveIndicators = [
        mood_rating,
        10 - stress_level,
        10 - anxiety_level,
        energy_level,
        work_satisfaction,
        work_life_balance_score,
        confidence_level,
        sleep_quality
      ];
      const overall_wellness = Math.round(
        positiveIndicators.reduce((sum, v) => sum + Math.max(0, Math.min(10, v)), 0) / positiveIndicators.length
      );

      // Derive simple risk level from stress and anxiety
      const riskBasis = (stress_level + anxiety_level) / 2;
      const risk_level: 'low' | 'medium' | 'high' = riskBasis >= 7 ? 'high' : riskBasis >= 4 ? 'medium' : 'low';

      const reportToSave = {
        employee_id: userId,
        company_id: companyId,
        mood_rating,
        stress_level,
        anxiety_level,
        work_satisfaction,
        work_life_balance: work_life_balance_score,
        energy_level,
        confidence_level,
        sleep_quality,
        overall_wellness,
        risk_level,
        ai_analysis: report.complete_report,
        session_type: report.session_type,
        session_duration: report.session_duration,
        metrics: report.metrics,
        metrics_explanation: report.metrics_explanation,
        physical_health_metrics: report.physical_health_metrics,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any;

      try {
        // Save report via custom backend API
        const SERVER = ServerAddress?.replace(/\/+$/, '') ?? 'http://127.0.0.1:8000';
        await fetch(`${SERVER}/api/reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportToSave),
        });
      } catch (saveError) {
        console.error('Failed to save report to backend:', saveError);
      }
    }

    return NextResponse.json({
      type: 'report',
      data: report
    });

  } catch (error: any) {
    console.error('Error generating wellness report:', error);
    throw error;
  }
}
