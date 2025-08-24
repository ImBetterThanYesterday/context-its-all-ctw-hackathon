// Simple server test
import 'dotenv/config'
import express from 'express'

console.log('🧪 Testing simple server startup...')
console.log('Environment variables:', {
  E2B_API_KEY: !!process.env.E2B_API_KEY,
  ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY
})

const app = express()
const port = 3001

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' })
})

app.listen(port, () => {
  console.log(`✅ Test server running on http://localhost:${port}`)
  console.log('✅ Server startup successful!')
  process.exit(0) // Exit after successful startup
})

// Exit after 3 seconds if something goes wrong
setTimeout(() => {
  console.log('❌ Server startup timed out')
  process.exit(1)
}, 3000)