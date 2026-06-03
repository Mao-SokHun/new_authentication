/** Tiny helper copy under auth forms — readable but unobtrusive */
export const FORM_FINE_PRINT_CLASS =
  'text-[10px] sm:text-[11px] text-slate-500 leading-tight'

/** Small note above forms: fields marked * are required */
const RequiredFieldsHint = ({ children, className = '' }) => (
  <p className={`${FORM_FINE_PRINT_CLASS} ${className}`.trim()}>{children}</p>
)

export default RequiredFieldsHint
