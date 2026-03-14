import { createClient } from '@insforge/sdk'

const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://39vsxs5z.us-east.insforge.app',
  anonKey: process.env.INSFORGE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODI3NjV9.gZ3Hrt3qG1YspdcAMYulTNJn3APjXuftKtpaOqcC5bE'
})

export { insforge }
