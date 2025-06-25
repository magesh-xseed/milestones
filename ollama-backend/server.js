const express = require('express');
const { Ollama } = require('ollama');
const cors = require('cors');
const { getLessonPlanContent } = require('./lessonplan_customize'); 

const app = express();
const ollama = new Ollama({ host: 'http://localhost:11434' });

app.use(cors());
app.use(express.json());

// Existing Ollama chat endpoint for Scratch assistant
app.post('/api/ollama', async (req, res) => {
  try {
    const { query } = req.body;
    const response = await ollama.chat({
      model: 'mistral:instruct', // You can change the model if you have others
      messages: [
        {
          role: 'system',
          content: 'You are a Scratch coding assistant for kids. Provide clear, simple instructions for Scratch blocks to answer user queries. Avoid technical jargon.'
        },
        { role: 'user', content: query }
      ]
    });
    res.json(response.message.content);
  } catch (error) {
    console.error('Ollama Scratch assistant error:', error);
    res.status(500).json({ error: 'Failed to process Scratch assistant request' });
  }
});

// New endpoint for the "Words to Learn" lesson plan chatbot
app.post('/api/ollama/lesson-plan-chat', async (req, res) => {
  try {
    const { query } = req.body; 

    // Pass the lessonPlanId to getLessonPlanContent
    const lessonPlanString = await getLessonPlanContent();

    if (!lessonPlanString) {
      // Handle the case where the lesson plan is not found or is empty
      return res.status(404).json({ error: 'Lesson plan content not found for the provided ID.' });
    }

    console.log('Lesson Plan String:', lessonPlanString); // Debugging log

    const systemPrompt = `You are an AI assistant and a **strict data extractor**. Your sole purpose is to find and provide information *directly* from the provided "Words to Learn" lesson plan content.

    Follow these rules with **absolute strictness**:
    1.  **EXTRACT ONLY:** Your response must contain *only* information found verbatim or directly derivable from the provided lesson plan content. Do NOT generate, infer, or explain anything beyond what is explicitly stated.
    2.  **HANDLE FORMATTING:** If you encounter 'doc', 'paragraph', 'text', or 'italic' tags, interpret them as part of the surrounding text or an indication that the subsequent text is the relevant content. Extract the actual words within or after these tags.
    3.  **NO EXTERNAL KNOWLEDGE:** You must **NOT** use any external knowledge, general definitions, common phrases, typical scenarios, or references to anything not explicitly within the lesson plan (e.g., do not mention "foreign language classes," "ESL," typical lesson structures, or any songs/contexts unless they are named in the lesson plan).
    4.  **EXTREME BREVITY:** Your answer must be extremely brief and to the point, typically **under 50 words**. Focus on the core fact.
    5.  **DIRECT ANSWER:** Answer the user's question directly, as a factual statement.
    6.  **UNANSWERABLE:** If the question CANNOT be answered *solely and directly* from the provided lesson plan content, respond EXACTLY: "This question cannot be answered based on the provided lesson plan content."
    7.  **VERBATIM/EXACT PHRASING:** For any terms, descriptions, or explanations, use the **exact** phrasing provided in the lesson plan. Do not paraphrase.

    Lesson plan content:
    ${lessonPlanString}

Now, extract the answer to the user's question based *only* on the content above.`;

    const response = await ollama.chat({
      model: 'mistral:instruct', // You can change the model if you have others (e.g., 'llama3')
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ]
    });
    res.json(response.message.content);
  } catch (error) {
    console.error('Ollama lesson plan chat error:', error);
    res.status(500).json({ error: 'Failed to process lesson plan chat request' });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the Scratch Coding Assistant & Lesson Plan API');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));