import { useEffect, useState } from 'react'
import { Modal } from '../Modal'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Filter } from 'lucide-react'
import type { HistoryFilters } from '@/pages/History'
import { useTranslation } from 'react-i18next'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: HistoryFilters
  onApplyFilters: (filters: HistoryFilters) => void
}

const defaultFilters: HistoryFilters = {
  period: '30d',
  categories: [],
  duration: 'any',
  orderBy: 'recent',
  onlyPR: false,
}

const categories = [
  { label: 'Push', value: 'push' },
  { label: 'Pull', value: 'pull' },
  { label: 'Legs', value: 'lower-body' },
  { label: 'Upper', value: 'upper-body' },
  { label: 'Full', value: 'full-body' },
]

const FilterModal = ({
  open,
  onOpenChange,
  filters,
  onApplyFilters,
}: Props) => {
  const { t } = useTranslation()
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    if (open) {
      setLocalFilters(filters)
    }
  }, [open, filters])

  const updateFilter = <K extends keyof HistoryFilters>(
    key: K,
    value: HistoryFilters[K]
  ) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const clearFilters = () => {
    setLocalFilters(defaultFilters)
  }

  const handleApply = () => {
    onApplyFilters(localFilters)
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('filterModal.title')}
      description={t('filterModal.description')}
      icon={<Filter />}
      footer={
        <>
          <Button variant="ghost" onClick={clearFilters}>
            {t('filterModal.buttons.clear')}
          </Button>

          <Button className="rounded-xl px-6" onClick={handleApply}>
            {t('filterModal.buttons.apply')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label>{t('filterModal.labels.period')}</Label>

          <Select
            value={localFilters.period}
            onValueChange={(value) => updateFilter('period', value)}
          >
            <SelectTrigger className="w-full rounded-2xl">
              <SelectValue placeholder={t('filterModal.periods.select')} />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="7d">{t('filterModal.periods.7d')}</SelectItem>
              <SelectItem value="30d">{t('filterModal.periods.30d')}</SelectItem>
              <SelectItem value="90d">{t('filterModal.periods.90d')}</SelectItem>
              <SelectItem value="all">{t('filterModal.periods.all')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-3">
          <Label>{t('filterModal.labels.category')}</Label>

          <ToggleGroup
            type="multiple"
            value={localFilters.categories}
            onValueChange={(value) => updateFilter('categories', value)}
            className="flex flex-wrap justify-start gap-2"
          >
            {categories.map((category) => (
              <ToggleGroupItem
                key={category.value}
                value={category.value}
                className="
                  h-10 rounded-full border border-border/60
                  bg-card px-4 text-xs font-semibold
                  text-muted-foreground transition-all
                  hover:border-primary/40
                  hover:bg-primary/5
                  hover:text-foreground
                  data-[state=on]:border-primary
                  data-[state=on]:bg-primary
                  data-[state=on]:text-primary-foreground
                  data-[state=on]:shadow-sm
                "
              >
                {t(category.value, { ns: 'translation', keyPrefix: 'history.categories', defaultValue: category.label })}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>{t('filterModal.labels.duration')}</Label>

            <Select
              value={localFilters.duration}
              onValueChange={(value) => updateFilter('duration', value)}
            >
              <SelectTrigger className="w-full rounded-2xl">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="any">{t('filterModal.durations.any')}</SelectItem>
                <SelectItem value="short">{t('filterModal.durations.short')}</SelectItem>
                <SelectItem value="medium">{t('filterModal.durations.medium')}</SelectItem>
                <SelectItem value="long">{t('filterModal.durations.long')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t('filterModal.labels.orderBy')}</Label>

            <Select
              value={localFilters.orderBy}
              onValueChange={(value) => updateFilter('orderBy', value)}
            >
              <SelectTrigger className="w-full rounded-2xl">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="recent">{t('filterModal.orders.recent')}</SelectItem>
                <SelectItem value="volume">{t('filterModal.orders.volume')}</SelectItem>
                <SelectItem value="duration">{t('filterModal.orders.duration')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/20 p-4">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">
              {t('filterModal.labels.onlyPrTitle')}
            </span>

            <span className="text-xs text-muted-foreground">
              {t('filterModal.labels.onlyPrDesc')}
            </span>
          </div>

          <Switch
            checked={localFilters.onlyPR}
            onCheckedChange={(checked) => updateFilter('onlyPR', checked)}
          />
        </div>
      </div>
    </Modal>
  )
}

export default FilterModal