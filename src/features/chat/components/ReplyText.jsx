import { parseReply } from '../parseReply'

// Hiển thị lời văn của AI. Mô hình hay trả Markdown đơn giản (đoạn, gạch đầu dòng, **đậm**),
// nên chỉ hỗ trợ đúng các dạng đó. React tự escape chuỗi: không dùng dangerouslySetInnerHTML,
// để nội dung AI (hoặc dữ liệu nó trích lại) không thể chèn HTML/script.
function Inline({ text }) {
  // **đậm** → <strong>; các ký hiệu Markdown khác giữ nguyên dạng chữ.
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4
      ? <strong key={index}>{part.slice(2, -2)}</strong>
      : part)
}

export default function ReplyText({ text }) {
  return (
    <div className="chat-reply">
      {parseReply(text).map((block, index) => {
        if (block.type === 'paragraph') {
          return <p key={index}>{block.lines.map((line, lineIndex) => <span key={lineIndex}>{lineIndex > 0 && <br />}<Inline text={line} /></span>)}</p>
        }
        const List = block.ordered ? 'ol' : 'ul'
        return <List key={index}>{block.items.map((item, itemIndex) => <li key={itemIndex}><Inline text={item} /></li>)}</List>
      })}
    </div>
  )
}
