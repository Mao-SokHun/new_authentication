/** Small note above forms: fields marked * are required */
const RequiredFieldsHint = ({ children, className = '' }) => (
  <p className={`text-sm text-slate-500 leading-normal ${className}`.trim()}>{children}</p>
)

export default RequiredFieldsHint
