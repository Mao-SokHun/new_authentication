import clsx from 'clsx'

const SubjectTabs = ({ tabs, active, onChange, className, compact = false }) => (
  <div className={clsx(
    'flex items-center overflow-x-auto scrollbar-hide',
    compact ? 'gap-2 py-0.5' : 'gap-3 sm:gap-3.5 py-1',
    className
  )}>
    {tabs.map((tab) => (
      <button
        key={tab}
        type="button"
        onClick={() => onChange(tab)}
        className={clsx(
          'flex-shrink-0 rounded-full font-bold tracking-wide transition-all',
          compact ? 'px-3 py-1 text-[10px]' : 'px-4 py-2 text-xs',
          active === tab
            ? 'bg-primary-500 text-white'
            : 'glass-subtle border border-white/50 text-slate-600 hover:border-primary-200 hover:text-primary-600'
        )}
      >
        {tab}
      </button>
    ))}
  </div>
)

export default SubjectTabs
