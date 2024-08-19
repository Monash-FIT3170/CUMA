// for testing ai call

// instructions: 

// do: npm install @google/generative-ai

// generate an api key using your own account. 
// Then, copy and paste the api key into ".env" file under the name "AI_API_KEY".

import dotenv from 'dotenv';

import {GoogleGenerativeAI} from "@google/generative-ai"

dotenv.config();


// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

const gemini = async (unitInfo) => {
    const prompt = "Summarise this unit into small keywords: " + unitInfo + ". \nExtract keywords as an array only from the description.";
  
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = await response.text();
      return text;
    } catch (error) {
      console.error("Error generating content:", error);
    }
  };
  
  export default gemini;

  