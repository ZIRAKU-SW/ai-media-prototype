import path from 'node:path'
import { createDevDeployHandlers } from '@oceanos/dev-console/server/deploy'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const h = createDevDeployHandlers({
  projectRoot: process.env.DEV_CONSOLE_PROJECT_ROOT ?? path.resolve(/*turbopackIgnore: true*/ process.cwd()),
})

export const GET = h.GET
export const POST = h.POST
