import { Check, Clock3, RefreshCw } from 'lucide-react'
import { dayLabel } from '../../appointment-slots/utils'

export default function BookingSlotPicker({ days, date, onDateChange, doctorId, loading, error, slots, selected, onSelect, onReload, disabled }) {
  return <section className="appointment-section">
    <div className="appointment-section-title"><span>02</span><div><h2>Chọn ngày và giờ khám</h2><p>Lịch mở trong 7 ngày, mỗi lượt khám 30 phút.</p></div></div>
    <div className="appointment-days" role="group" aria-label="Ngày khám">
      {days.map((day, index) => <button type="button" key={day} aria-pressed={date === day} aria-label={dayLabel(day)} disabled={disabled} onClick={() => onDateChange(day)}>
        <span>{index === 0 ? 'Hôm nay' : dayLabel(day, { weekday: 'short' })}</span><strong>{day.slice(8)}</strong><span>Tháng {Number(day.slice(5, 7))}</span>
      </button>)}
    </div>
    <div className="appointment-slot-heading"><p>{dayLabel(date)}</p><button type="button" className="appointment-text-button" onClick={onReload} disabled={!doctorId || loading || disabled}><RefreshCw size={14} aria-hidden="true" />Tải lại giờ trống</button></div>
    <div aria-busy={loading}>
      {!doctorId ? <div className="appointment-empty"><Clock3 size={26} aria-hidden="true" /><h3>Chọn bác sĩ để xem giờ trống</h3><p>Các khung giờ có thể đặt sẽ xuất hiện tại đây.</p></div>
        : loading ? <div className="appointment-empty" role="status"><p>Đang tìm khung giờ còn trống…</p></div>
          : error ? <div className="appointment-empty" role="alert"><h3>Chưa tải được giờ trống</h3><p>{error}</p><button type="button" className="appointment-button" disabled={disabled} onClick={onReload}>Thử lại</button></div>
            : !slots.length ? <div className="appointment-empty"><Clock3 size={26} aria-hidden="true" /><h3>Chưa có giờ trống trong ngày này</h3><p>Bạn có thể chọn ngày khác hoặc một bác sĩ khác.</p></div>
              : [{ label: 'Buổi sáng', from: '00:00', to: '12:00' }, { label: 'Buổi chiều', from: '12:00', to: '18:00' }, { label: 'Buổi tối', from: '18:00', to: '24:00' }].map(({ label, from, to }) => {
                const items = slots.filter((slot) => slot.startTime >= from && slot.startTime < to)
                return items.length > 0 && <div className="appointment-period" key={label}><h3>{label}<span>{items.length} giờ trống</span></h3><div className="appointment-slot-grid">
                  {items.map((slot) => <button type="button" key={slot.appointmentSlotId} aria-pressed={selected?.appointmentSlotId === slot.appointmentSlotId} disabled={disabled} onClick={() => onSelect(slot)}>
                    {slot.startTime.slice(0, 5)} – {slot.endTime.slice(0, 5)}{selected?.appointmentSlotId === slot.appointmentSlotId && <Check size={14} aria-hidden="true" />}
                  </button>)}
                </div></div>
              })}
    </div>
  </section>
}
