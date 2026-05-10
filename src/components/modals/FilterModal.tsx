import { useEffect, useState } from 'react'

import { Modal } from '../Modal'

import { Button } from '@/components/ui/button'

import { Label } from '@/components/ui/label'

import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group'

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

type Props = {
  open: boolean

  onOpenChange: (
    open: boolean
  ) => void

  filters: HistoryFilters

  onApplyFilters: (
    filters: HistoryFilters
  ) => void
}

const defaultFilters: HistoryFilters =
  {
    period: '30d',
    categories: [],
    duration: 'any',
    orderBy: 'recent',
    onlyPR: false,
  }

const categories = [
  {
    label: 'Push',
    value: 'push',
  },
  {
    label: 'Pull',
    value: 'pull',
  },
  {
    label: 'Legs',
    value: 'lower-body',
  },
  {
    label: 'Upper',
    value: 'upper-body',
  },
  {
    label: 'Full',
    value: 'full-body',
  },
]

const FilterModal = ({
  open,
  onOpenChange,
  filters,
  onApplyFilters,
}: Props) => {
  const [
    localFilters,
    setLocalFilters,
  ] = useState(filters)

  useEffect(() => {
    if (open) {
      setLocalFilters(filters)
    }
  }, [open, filters])

  const updateFilter = <
    K extends keyof HistoryFilters
  >(
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
      title="Filter history"
      description="Refine your workout timeline"
      icon={<Filter />}
      footer={
        <>
          <Button
            variant="ghost"
            onClick={clearFilters}
          >
            Clear
          </Button>

          <Button
            className="rounded-xl px-6"
            onClick={handleApply}
          >
            Apply filters
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">

        {/* PERIOD */}
        <div className="flex flex-col gap-2">

          <Label>Period</Label>

          <Select
            value={
              localFilters.period
            }
            onValueChange={(value) =>
              updateFilter(
                'period',
                value
              )
            }
          >
            <SelectTrigger className="w-full rounded-2xl">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="7d">
                Last 7 days
              </SelectItem>

              <SelectItem value="30d">
                Last 30 days
              </SelectItem>

              <SelectItem value="90d">
                Last 90 days
              </SelectItem>

              <SelectItem value="all">
                All time
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* CATEGORY */}
        <div className="flex flex-col gap-3">

          <Label>Category</Label>

          <ToggleGroup
            type="multiple"
            value={
              localFilters.categories
            }
            onValueChange={(value) =>
              updateFilter(
                'categories',
                value
              )
            }
            className="flex flex-wrap justify-start gap-2"
          >
            {categories.map(
              (category) => (
                <ToggleGroupItem
                  key={
                    category.value
                  }
                  value={
                    category.value
                  }
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
                  {category.label}
                </ToggleGroupItem>
              )
            )}
          </ToggleGroup>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

          <div className="flex flex-col gap-2">

            <Label>Duration</Label>

            <Select
              value={
                localFilters.duration
              }
              onValueChange={(value) =>
                updateFilter(
                  'duration',
                  value
                )
              }
            >
              <SelectTrigger className="w-full rounded-2xl">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="any">
                  Any
                </SelectItem>

                <SelectItem value="short">
                  Up to 30 minutes
                </SelectItem>

                <SelectItem value="medium">
                  30-60min
                </SelectItem>

                <SelectItem value="long">
                  More than 60min
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">

            <Label>Order by</Label>

            <Select
              value={
                localFilters.orderBy
              }
              onValueChange={(value) =>
                updateFilter(
                  'orderBy',
                  value
                )
              }
            >
              <SelectTrigger className="w-full rounded-2xl">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="recent">
                  Most recent
                </SelectItem>

                <SelectItem value="volume">
                  Most volume
                </SelectItem>

                <SelectItem value="duration">
                  Most duration
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ONLY PR */}
        <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/20 p-4">

          <div className="flex flex-col">

            <span className="text-sm font-semibold">
              Only PR workouts
            </span>

            <span className="text-xs text-muted-foreground">
              Show only personal
              records
            </span>
          </div>

          <Switch
            checked={
              localFilters.onlyPR
            }
            onCheckedChange={(
              checked
            ) =>
              updateFilter(
                'onlyPR',
                checked
              )
            }
          />
        </div>
      </div>
    </Modal>
  )
}

export default FilterModal