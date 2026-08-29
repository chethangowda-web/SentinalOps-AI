import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

export interface LLMResponse {
  language: 'en' | 'kn' | 'hi';
  incidentDetails?: {
    title: string;
    service: string;
    environment: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
  rootCause?: string;
  confidence?: number;
  remediationPlan?: string[];
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  explanation: string;
}

export function extractCleanJSON(raw: string): string {
  // Remove <think>...</think> tags from thinking models
  let clean = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  // Remove markdown code fences
  clean = clean.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').replace(/```/g, '').trim();
  // Find outermost JSON object {...}
  const match = clean.match(/\{[\s\S]*\}/);
  if (match) return match[0];
  return clean;
}

export class LLMService {
  private apiKey: string | undefined;
  private provider: 'groq' | 'openai' | 'mock';

  constructor() {
    // Read from env configuration
    if (process.env.GROQ_API_KEY) {
      this.apiKey = process.env.GROQ_API_KEY;
      this.provider = 'groq';
    } else if (process.env.OPENAI_API_KEY) {
      this.apiKey = process.env.OPENAI_API_KEY;
      this.provider = 'openai';
    } else {
      this.provider = 'mock';
    }
    console.log(`🤖 LLM Service initialized with provider: ${this.provider.toUpperCase()}`);
  }

  /**
   * Abstracted call to generate completions across models
   */
  async chat(prompt: string, systemInstruction: string): Promise<string> {
    if (this.provider === 'openai' && this.apiKey) {
      return this.callOpenAI(prompt, systemInstruction);
    } else if (this.provider === 'groq' && this.apiKey) {
      return this.callGroq(prompt, systemInstruction);
    }
    return this.fallbackMockCompletion(prompt);
  }

  private async callOpenAI(prompt: string, systemInstruction: string): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1
        })
      });
      const data = await response.json() as any;
      const rawContent = data.choices[0].message.content || '';
      return extractCleanJSON(rawContent);
    } catch (error) {
      console.error('OpenAI API call failed, falling back to mock:', error);
      return this.fallbackMockCompletion(prompt);
    }
  }

  private async callGroq(prompt: string, systemInstruction: string): Promise<string> {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.6-27b',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1
        })
      });
      const data = await response.json() as any;
      if (data.error) {
        throw new Error(data.error.message || 'Groq error');
      }
      const rawContent = data.choices[0].message.content || '';
      return extractCleanJSON(rawContent);
    } catch (error) {
      console.error('Groq API call failed, falling back to mock:', error);
      return this.fallbackMockCompletion(prompt);
    }
  }

  private fallbackMockCompletion(prompt: string): string {
    const isKannada = /[\u0C80-\u0CFF]/.test(prompt);
    const isHindi = /[\u0900-\u097F]/.test(prompt);

    const isK8s = prompt.includes('Kubernetes') || prompt.includes('Payment');
    const isRedis = prompt.includes('Redis');

    const response: LLMResponse = {
      language: isKannada ? 'kn' : isHindi ? 'hi' : 'en',
      incidentDetails: {
        title: isK8s ? 'Kubernetes Pod CrashLoopBackOff' : isRedis ? 'Redis Cache Latency Spike' : 'HTTP 500 API Failure',
        service: isK8s ? 'Payment Service' : isRedis ? 'Redis Cluster' : 'Staging API',
        environment: isK8s ? 'Production' : isRedis ? 'Production' : 'Staging',
        severity: isK8s ? 'CRITICAL' : isRedis ? 'MEDIUM' : 'HIGH'
      },
      rootCause: isK8s 
        ? 'Out-of-memory kill due to memory leak in v2.4.1'
        : isRedis
        ? 'Redis cache memory fragmentation threshold exceeded'
        : 'Database connection pool exhaustion',
      confidence: 94,
      remediationPlan: isK8s 
        ? [
            'Roll back Payment Service deployment to v2.3.9',
            'Increase container pod memory limits to 1024Mi',
            'Verify zero CrashLoopBackOff restarts'
          ]
        : isRedis
        ? [
            'Trigger active memory defragmentation on Redis cluster',
            'Update maxmemory eviction policy to allkeys-lru',
            'Flush volatile expired cache keys'
          ]
        : [
            'Verify database health using pg_stat_activity',
            'Inspect active database connections count',
            'Validate connection pool limits configuration',
            'Restart affected API gateway instances'
          ],
      risk: isK8s ? 'CRITICAL' : 'HIGH',
      explanation: isKannada 
        ? 'ಸಮಸ್ಯೆ ಪತ್ತೆಯಾಗಿದೆ. ಸುರಕ್ಷಿತ ಮರುಪ್ರಾರಂಭ ಅಥವಾ ರೋಲ್‌ಬ್ಯಾಕ್ ಕ್ರಮ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.'
        : isHindi
        ? 'समस्या की पहचान हो गई है। सुधारात्मक कार्रवाई की सिफारिश की गई है।'
        : 'Anomaly diagnosed. Remediation plan formulated with automated safety validation.'
    };

    return JSON.stringify(response);
  }
}

export const llm = new LLMService();
