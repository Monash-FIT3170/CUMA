// for testing gpt call

// First generate an openAI api key using your own account. 
// Then, copy and paste the api key into ".env" file under the name "OPENAI_API_KEY".

// To run, 
// pull up terminal, navigate to this file, then do "node gptTest.js"


import dotenv from 'dotenv';
dotenv.config();

    fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Say this is a test!' }],
          temperature: 0.7
        })
      })
      .then(response => console.log(response.json()))
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));
    
