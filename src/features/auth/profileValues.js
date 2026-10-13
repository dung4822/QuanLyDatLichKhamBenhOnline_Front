export const emptyProfile = { fullName: '', dateOfBirth: '', gender: '', phoneNumber: '', email: '', address: '' }
export function profilePayload(values) {
  return { fullName: values.fullName.trim(), dateOfBirth: values.dateOfBirth, gender: Number(values.gender), phoneNumber: values.phoneNumber.trim(), email: values.email?.trim() || null, address: values.address?.trim() || null }
}
export function profileValidation(values) {
  if (values.fullName.trim().length < 3) return 'Họ và tên cần ít nhất 3 ký tự, không tính khoảng trắng ở đầu và cuối.'
  if (!values.phoneNumber.trim()) return 'Vui lòng nhập số điện thoại liên hệ.'
  return ''
}
