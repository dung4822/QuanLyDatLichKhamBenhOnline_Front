// Tách lời văn Markdown đơn giản của AI thành các khối: đoạn văn và danh sách.
const LIST_ITEM = /^\s*(?:[-*•]|\d+[.)])\s+/

export function parseReply(text) {
  const blocks = []
  for (const line of text.replace(/\r\n/g, '\n').split('\n')) {
    const isItem = LIST_ITEM.test(line)
    const last = blocks.at(-1)
    if (!line.trim()) {
      if (last) last.closed = true
    } else if (isItem) {
      const ordered = /^\s*\d/.test(line)
      const content = line.replace(LIST_ITEM, '')
      if (last?.type === 'list' && last.ordered === ordered && !last.closed) last.items.push(content)
      else blocks.push({ type: 'list', ordered, items: [content] })
    } else if (last?.type === 'paragraph' && !last.closed) {
      last.lines.push(line.trim())
    } else {
      blocks.push({ type: 'paragraph', lines: [line.trim()] })
    }
  }
  return blocks
}
