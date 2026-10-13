import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import Notice from './Notice'

export default function Modal({ title, description, isBusy, errorMessage, onClose, wide = false, children }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    const previouslyFocused = document.activeElement
    const previousOverflow = document.body.style.overflow

    // Native dialog giữ focus trong modal và làm phần nền không tương tác được.
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    const firstField = dialog.querySelector('input:not([disabled]), select:not([disabled]), textarea:not([disabled])')
    firstField?.focus()

    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [])

  useEffect(() => {
    // Với form dài, lỗi lưu phải nằm trong vùng người dùng đang nhìn thấy.
    if (errorMessage) dialogRef.current.scrollTop = 0
  }, [errorMessage])

  function requestClose() {
    if (!isBusy) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className={`app-modal ${wide ? 'app-modal--wide' : ''}`}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      aria-busy={isBusy}
      onCancel={(event) => {
        // React sở hữu trạng thái mở/đóng; Escape cũng đi qua cùng một hàm đóng.
        event.preventDefault()
        requestClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose()
      }}
    >
      <div className="modal-inner">
        <header className="modal-header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description && <p id={descriptionId}>{description}</p>}
          </div>
          <button type="button" className="modal-close" onClick={requestClose} disabled={isBusy} aria-label="Đóng biểu mẫu">
            <X size={20} />
          </button>
        </header>
        <Notice notice={errorMessage ? { type: 'error', message: errorMessage } : null} />
        {children}
      </div>
    </dialog>
  )
}
