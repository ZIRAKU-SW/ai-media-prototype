import path from 'node:path'
import { createDevUploadHandlers } from '@oceanos/dev-console/server/upload'

export const dynamic = 'force-dynamic'

const h = createDevUploadHandlers({
  projectRoot: process.env.DEV_CONSOLE_PROJECT_ROOT ?? path.resolve(process.cwd()),
})

export const GET = h.GET
export const POST = h.POST
