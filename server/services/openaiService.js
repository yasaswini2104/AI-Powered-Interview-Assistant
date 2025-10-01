// server\services\openaiService.js
import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY;
const MODEL_NAME = 'gemini-2.5-flash-lite';

const callGoogleAI = (payload) => {
  return new Promise((resolve, reject) => {
    if (!API_KEY) {
      return reject(new Error("Google API Key is not loaded. Check your .env file and server start command."));
    }
    
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          if (parsedData.error) {
            console.error("Error from Google AI API:", parsedData.error.message);
            return reject(new Error(parsedData.error.message));
          }
          if (!parsedData.candidates || parsedData.candidates.length === 0) {
            console.error("Google AI returned no candidates. Response:", data);
            return reject(new Error("AI response was empty or blocked."));
          }
          const textContent = parsedData.candidates[0].content.parts[0].text;
          resolve(textContent);
        } catch (e) {
          console.error("Error parsing Google AI response:", data);
          reject(new Error("Could not parse response from Google AI."));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(JSON.stringify(payload));
    req.end();
  });
};
export const generateQuestion = async (role, difficulty, history) => {
  const prompt = `Generate one ${difficulty}-level interview question for a ${role}. Previously asked: ${history.join(', ')}. Ensure it's unique. Respond with only the question text.`;
  const payload = { contents: [{ parts: [{ text: prompt }] }] };
  const responseText = await callGoogleAI(payload);
  if (!responseText) throw new Error("Failed to generate question from AI.");
  return responseText.trim();
};

export const evaluateAnswer = async (question, answer) => {
  const prompt = `Evaluate the answer. Question: "${question}" Answer: "${answer}" Respond ONLY as a valid JSON object: {"score": <1-10>, "feedback": "<One sentence feedback>", "skillTags": ["<skill 1>", "<skill 2>"]}`;
  const payload = { contents: [{ parts: [{ text: prompt }] }] };
  const jsonString = await callGoogleAI(payload);
  if (!jsonString) throw new Error("Failed to get evaluation from AI.");
  const cleanedJson = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleanedJson);
};

export const generateFinalSummary = async (history, role) => {
  const transcript = history.map(e => `Q: ${e.question}\nA: ${e.answer}\nScore: ${e.score || 'N/A'}`).join('\n\n');
  
  const prompt = `You are a senior hiring manager responsible for hiring a "${role}". 
Based on the following interview transcript, provide a final, critical evaluation.

Transcript:
${transcript}

Your evaluation must be ONLY a valid JSON object in the following format:
{
  "summary": "<A concise, 2-3 sentence summary of the candidate's overall performance>",
  "insights": {
    "strengths": ["<An array of 2-3 key strengths observed>"],
    "weaknesses": ["<An array of 1-2 areas for improvement>"]
  },
  "recommendation": {
    "verdict": "<Choose ONE of the following 5 categories: 'Strong Hire', 'Hire', 'Leaning Hire', 'Leaning No Hire', 'No Hire'>",
    "justification": "<A 1-2 sentence justification for your verdict, explaining why they are or are not a good fit for the ${role} position.>"
  }
}`;

  const payload = { contents: [{ parts: [{ text: prompt }] }] };
  const jsonString = await callGoogleAI(payload);
  if (!jsonString) throw new Error("Failed to get summary from AI.");
  const cleanedJson = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleanedJson);
};
