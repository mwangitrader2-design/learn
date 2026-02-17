// Run with: node test-api.js
const fetch = require('node-fetch');

async function testOpenAI() {
  const response = await fetch('https://api.openai.com/v1/models', {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    }
  });
  
  if (response.ok) {
    const data = await response.json();
    console.log('✅ OpenAI API key is valid!');
    console.log('Available models:', data.data.length);
  } else {
    console.log('❌ Invalid OpenAI API key');
  }
}

testOpenAI();
