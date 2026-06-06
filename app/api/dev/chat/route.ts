import path from 'node:path'
import { createDevChatHandlers } from '@oceanos/dev-console/server/chat'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const PROJECT_ROOT =
  process.env.DEV_CONSOLE_PROJECT_ROOT ?? path.resolve(process.cwd())

const h = createDevChatHandlers({
  projectRoot: PROJECT_ROOT,
  pythonModule: process.env.DEV_CONSOLE_PYTHON_MODULE ?? 'ai_media_agent.dev_agent',
})

export const GET = h.GET
export const POST = h.POST
export const DELETE = h.DELETE
