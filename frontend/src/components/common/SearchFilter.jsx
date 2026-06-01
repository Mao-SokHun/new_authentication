import { useMemo } from 'react'
import { Search } from 'lucide-react'
import clsx from 'clsx'
import FilterBar from './FilterBar'
import Button from '@/components/ui/Button'
import { FILTER_ALL } from '@/constants'
import { getSubjectFilterOptions } from '@/constants'
import { useTranslation } from '@/i18n'
import { localizeOptionList, useLocalizedFilterOptions } from '@/lib/localizeOptions'

/**
 * Teacher search filter panel.
 * Backend team: each filter maps to a query param on GET /teachers
 *   - major     → ?major=Computer+Science
 *   - subject   → ?subject=React+JS
 *   - location  → ?location=Phnom+Penh
 *   - time      → ?time=08:00–10:00 (schedule only)
 */
const SearchFilter = ({
  filters = {},
  onFilterChange,
  onReset,
  variant = 'home',
  showSearchButton = false,
  onSearch,
  className,
}) => {
  const { t, labelFor } = useTranslation()
  const opts = useLocalizedFilterOptions()

  const majorIsAll = filters.major === FILTER_ALL.major

  const subjectOptions = useMemo(() => {
    const values = getSubjectFilterOptions(filters.major)
    return localizeOptionList(values, labelFor)
  }, [filters.major, labelFor])

  const searchableField = (field) => ({
    ...field,
    searchable: true,
    pinnedOptions: field.options.slice(0, 1),
  })

  const baseFields = [
    searchableField({
      id: 'major',
      label: t('filters.major'),
      value: filters.major,
      options: opts.majors,
      onChange: (v) => onFilterChange('major', v),
    }),
    searchableField({
      id: 'subject',
      label: t('filters.subject'),
      value: filters.subject,
      options: subjectOptions,
      onChange: (v) => onFilterChange('subject', v),
      disabled: majorIsAll,
    }),
    searchableField({
      id: 'location',
      type: 'location',
      label: t('filters.location'),
      value: filters.location,
      options: opts.locations,
      onChange: (v) => onFilterChange('location', v),
      detail: {
        district: filters.locationDistrict ?? '',
        commune: filters.locationCommune ?? '',
        village: filters.locationVillage ?? '',
      },
      onDetailChange: onFilterChange,
    }),
  ]

  const extendedFields = [
    ...baseFields,
    searchableField({
      id: 'time',
      label: t('filters.time'),
      value: filters.time,
      options: opts.times,
      onChange: (v) => onFilterChange('time', v),
      minWidth: 'min-w-[148px]',
    }),
  ]

  const fields = variant === 'schedule' ? extendedFields : baseFields

  return (
    <div
      className={clsx(
        'rounded-xl border border-white/50 bg-white/45 backdrop-blur-md shadow-sm overflow-visible p-2.5 sm:p-3',
        className
      )}
    >
      <FilterBar embedded fields={fields} onReset={onReset}>
        {showSearchButton && (
          <Button size="sm" onClick={onSearch} className="ml-auto !py-2">
            <Search className="w-4 h-4 mr-1.5" />
            {t('filters.search')}
          </Button>
        )}
      </FilterBar>
    </div>
  )
}

export default SearchFilter
