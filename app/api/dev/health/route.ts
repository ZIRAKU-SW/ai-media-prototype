import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { proxyDevRequest, shouldProxyToBackend } from '@oceanos/dev-console/server/proxy'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  if (shouldProxyToBackend()) {
    return proxyDevRequest(request, 'health')
  }

  const projectRoot =
    process.env.DEV_CONSOLE_PROJECT_ROOT ?? path.resolve(/*turbopackIgnore: true*/ process.cwd())

  const mod = process.env.DEV_CONSOLE_PYTHON_MODULE ?? 'ai_media_agent.dev_agent'
  const py = process.env.DEV_CONSOLE_PYTHON ?? 'python3'
  const r = spawnSync(py, ['-c', `import importlib; importlib.import_module("${mod}")`], {
    cwd: projectRoot,
    timeout: 5000,
  })
  const pythonOk = r.status === 0

  return NextResponse.json({
    mode: 'backend',
    ok: true,
    project_root: projectRoot,
    python_module: process.env.DEV_CONSOLE_PYTHON_MODULE ?? 'ai_media_agent.dev_agent',
    python_ok: pythonOk,
    password_required: Boolean(process.env.DEV_CONSOLE_PASSWORD),
  })
}
