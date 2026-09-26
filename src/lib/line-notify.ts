export async function sendLineNotify(message: string) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  const to = process.env.LINE_GROUP_ID
  
  if (!token || !to) return

  try {
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        to: to,
        messages: [
          {
            type: 'text',
            text: message
          }
        ]
      })
    })
    
    if (!response.ok) {
      const errorData = await response.text()
      console.error('Failed to send Line message:', errorData)
    }
  } catch (err) {
    console.error('Error sending Line message:', err)
  }
}
