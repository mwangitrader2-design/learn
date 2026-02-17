import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    console.log('Sending to OpenAI:', message)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI learning assistant. Provide clear, accurate, and educational responses.'
          },
          ...(history || []),
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API Error:', response.status, errorData)
      return NextResponse.json(
        { error: `OpenAI API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('OpenAI Response:', data)

    return NextResponse.json({
      response: data.choices[0].message.content,
      usage: data.usage
    })
    
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Failed to process request. Check your OpenAI API key.' },
      { status: 500 }
    )
  }
}
