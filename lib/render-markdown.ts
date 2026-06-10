export function renderMarkdown(raw: string): string {
  const TH = 'padding:10px 14px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:700;text-align:left'
  const TD = 'padding:10px 14px;border:1px solid #e5e7eb;vertical-align:top'
  const isSepRow = (s: string) => /^\|[\s|:\-]+\|$/.test(s)
  const parseRow = (s: string, tag: 'th' | 'td') =>
    '<tr>' + s.replace(/^\||\|$/g, '').split('|').map(c =>
      `<${tag} style="${tag === 'th' ? TH : TD}">${c.trim()}</${tag}>`).join('') + '</tr>'

  const saved: string[] = []
  let text = raw.replace(/```[\s\S]*?```/g, m => {
    saved.push(
      `<pre class="article-detail__code"><code>${
        m.replace(/```\w*\n?/, '').replace(/```$/, '').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      }</code></pre>`
    )
    return `\x00CODE${saved.length - 1}\x00`
  })

  const lines = text.split('\n')
  const out: string[] = []
  let tableLines: string[] = []

  const flushTable = () => {
    if (!tableLines.length) return
    const hasSep = tableLines.some(isSepRow)
    let isHeader = hasSep
    const rows: string[] = []
    for (const l of tableLines) {
      if (isSepRow(l)) { isHeader = false; continue }
      rows.push(parseRow(l, isHeader ? 'th' : 'td'))
      if (isHeader) isHeader = false
    }
    out.push(`<div class="article-detail__table-wrap"><table class="article-detail__table">${rows.join('')}</table></div>`)
    tableLines = []
  }

  for (const line of lines) {
    if (line.trimStart().startsWith('|')) tableLines.push(line)
    else { flushTable(); out.push(line) }
  }
  flushTable()
  text = out.join('\n')

  return text
    .replace(/^### (.+)$/gm, '<h3 class="article-detail__h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="article-detail__h2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="article-detail__h1">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="article-detail__inline-code">$1</code>')
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/(<\/li>\n)(?=<li)/g, '$1')
    .replace(/(<li[\s\S]+?<\/li>)(\n(?!<li))/g, '<ul class="article-detail__ul">$1</ul>$2')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\x00CODE(\d+)\x00/g, (_m, i) => saved[Number(i)])
}
