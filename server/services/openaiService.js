  /**
 * OpenAI service - resume analysis, interview questions, evaluation, feedback
 * Falls back to mock data when API key is missing or API fails.
 */
import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey && !apiKey.includes('placeholder') ? new OpenAI({ apiKey }) : null;

// Log OpenAI status at startup
console.log('[OpenAI] API key present:', !!apiKey);
console.log('[OpenAI] Client initialized:', !!openai);

function useMock() {
  return !openai;
}

/**
 * Analyze resume text and return structured analysis
 */
export async function analyzeResume(text) {
  console.log('[OpenAI] analyzeResume called, useMock:', useMock());
  if (!useMock()) {
    try {
      const prompt = `You are an expert career coach. Analyze this resume and respond with a valid JSON object (no markdown, no code block) with exactly these keys:
- skills: array of strings (technical and soft skills mentioned)
- strengths: array of strings (key strengths)
- weaknesses: array of strings (gaps or areas to improve)
- roleSuitability: string (1-2 sentences on suitable roles)
- summary: string (2-4 sentence executive summary: candidate's background, key experience, main skills, and career focus. Write in third person. Do NOT copy raw text, contact details (email, phone, LinkedIn), or verbatim excerpts. Be concise and professional.)

Resume text:
---
${text.slice(0, 12000)}
---

Return only the JSON object.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });
      const raw = completion.choices[0].message.content.trim();
      const jsonStr = raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
      return { analysis: JSON.parse(jsonStr), rawResponse: raw };
    } catch (err) {
      console.warn('OpenAI analyzeResume failed, using mock:', err.message);
      if (err.response?.status) console.warn('  API status:', err.response.status, err.response.data?.error?.message || '');
    }
  }
  const excerpt = (text || '').slice(0, 500).replace(/\s+/g, ' ');
  return {
    analysis: {
      skills: ['Communication', 'Problem solving', 'Teamwork', 'Resume-based skills'],
      strengths: ['Strong background from resume', 'Relevant experience'],
      weaknesses: ['Consider adding more quantifiable achievements'],
      roleSuitability: 'Suitable for roles matching experience and skills listed in the resume.',
      summary: excerpt ? `Professional with experience. Resume excerpt: ${excerpt}...` : 'Professional profile from uploaded resume.',
    },
    rawResponse: 'Mock analysis (set OPENAI_API_KEY for real AI).',
  };
}

/**
 * Generate interview questions based on resume analysis and mode
 */
export async function generateInterviewQuestions(resumeText, analysis, mode) {
  console.log('[OpenAI] generateInterviewQuestions called, useMock:', useMock(), 'mode:', mode);
  if (!useMock()) {
    try {
      const modeDesc = {
        hr: 'HR / general fit and motivation',
        technical: 'Technical skills and problem-solving',
        behavioral: 'Behavioral / STAR format',
      };
      const prompt = `You are an expert interviewer. Generate exactly 5 UNIQUE, PERSONALIZED interview questions for a ${modeDesc[mode]} interview.

CRITICAL: Base questions STRICTLY on this specific candidate's resume. Reference their actual experience, projects, skills, and background. Each user must get DIFFERENT questions - never use the same generic set. Vary question types and make them specific to this candidate.

Resume summary: ${(analysis && analysis.summary) || 'Not provided'}
Skills: ${(analysis && analysis.skills && analysis.skills.join(', ')) || 'Not provided'}

Resume excerpt (first 3000 chars):
${(resumeText || '').slice(0, 3000)}

Return a valid JSON array of exactly 5 strings, each being one question. Example: ["Question 1?", "Question 2?", ...]
No other text, only the JSON array.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
      });
      const raw = completion.choices[0].message.content.trim();
      const jsonStr = raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (err) {
      console.warn('OpenAI generateInterviewQuestions failed, using mock:', err.message);
      if (err.response?.status) console.warn('  API status:', err.response.status, err.response.data?.error?.message || '');
    }
  }
  const modeQuestions = {
    hr: [
      'Tell me about yourself.',
      'Why do you want to work here?',
      'What are your strengths and weaknesses?',
      'Where do you see yourself in 5 years?',
      'Why should we hire you?',
    ],
    technical: [
      'Describe a technical challenge you solved.',
      'How do you stay updated with new technologies?',
      'Explain a project you are proud of.',
      'How do you approach debugging?',
      'What tools do you use for development?',
    ],
    behavioral: [
      'Describe a time you worked under pressure.',
      'Tell me about a conflict with a teammate and how you resolved it.',
      'Give an example of when you showed leadership.',
      'Describe a time you failed and what you learned.',
      'Tell me about a goal you achieved.',
    ],
  };
  return modeQuestions[mode] || modeQuestions.hr;
}

/**
 * Evaluate a single answer and return feedback
 */
export async function evaluateAnswer(question, userAnswer, mode) {
  console.log('[OpenAI] evaluateAnswer called, useMock:', useMock());
  if (!useMock()) {
    try {
      const prompt = `You are an expert interviewer giving real-time feedback. 
Question: ${question}
Candidate answer (transcribed): ${userAnswer || '(No answer or inaudible)'}
Interview mode: ${mode}

Respond with a valid JSON object (no markdown) with:
- feedback: string (2-4 sentences, constructive)
- score: number 0-100 (how good the answer was)

Return only the JSON object.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
      });
      const raw = completion.choices[0].message.content.trim();
      const jsonStr = raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (err) {
      console.warn('OpenAI evaluateAnswer failed, using mock:', err.message);
      if (err.response?.status) console.warn('  API status:', err.response.status, err.response.data?.error?.message || '');
    }
  }
  const hasAnswer = (userAnswer || '').trim().length > 10;
  return {
    feedback: hasAnswer
      ? 'Good effort. Try to add more specific examples and structure your answer using the STAR format (Situation, Task, Action, Result) for stronger responses.'
      : 'Consider giving a longer, more detailed answer with concrete examples from your experience.',
    score: hasAnswer ? 70 : 50,
  };
}

/**
 * Generate final interview feedback and scores
 */
export async function generateFinalFeedback(qaList, mode) {
  console.log('[OpenAI] generateFinalFeedback called, useMock:', useMock());
  if (!useMock()) {
    try {
      const qaText = qaList
        .map(
          (qa, i) =>
            `Q${i + 1}: ${qa.question}\nA: ${qa.userAnswer || 'N/A'}\nFeedback: ${qa.aiFeedback || 'N/A'}\nScore: ${qa.score ?? 'N/A'}`
        )
        .join('\n\n');

      const prompt = `You are an expert career coach. Based on this interview Q&A and per-answer feedback, provide final evaluation.

Interview mode: ${mode}

${qaText}

Respond with a valid JSON object (no markdown) with:
- communication: number 0-100
- confidence: number 0-100
- technicalDepth: number 0-100
- overallFeedback: string (paragraph)
- improvementSuggestions: array of 3-5 strings

Return only the JSON object.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
      });
      const raw = completion.choices[0].message.content.trim();
      const jsonStr = raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (err) {
      console.warn('OpenAI generateFinalFeedback failed, using mock:', err.message);
      if (err.response?.status) console.warn('  API status:', err.response.status, err.response.data?.error?.message || '');
    }
  }
  const answered = qaList.filter((q) => (q.userAnswer || '').trim().length > 0).length;
  const avgScore = qaList.length ? Math.round(qaList.reduce((s, q) => s + (q.score ?? 0), 0) / qaList.length) : 70;
  return {
    communication: Math.min(100, avgScore + 5),
    confidence: Math.min(100, avgScore),
    technicalDepth: mode === 'technical' ? Math.min(100, avgScore + 10) : avgScore,
    overallFeedback: `You answered ${answered} of ${qaList.length} questions. Overall, your responses showed a basic understanding of the topics. Focus on providing more detailed answers with specific examples from your experience to demonstrate your skills more effectively.`,
    improvementSuggestions: [
      'Prepare specific examples using the STAR format (Situation, Task, Action, Result) for behavioral questions.',
      'Practice speaking clearly and at a steady pace to improve communication.',
      'Research the company and role beforehand to give more tailored responses.',
      'Quantify your achievements where possible (e.g., "increased efficiency by 20%").',
      'Ask clarifying questions if needed to ensure you understand what is being asked.',
    ],
  };
}
