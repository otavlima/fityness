import { useState } from "react"
import { Modal } from "../Modal"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Filter } from "lucide-react"

const FilterModal = ({ open, onOpenChange }: any) => {
  const [period, setPeriod] = useState("30d")
  const [categories, setCategories] = useState<string[]>([])
  const [duration, setDuration] = useState("any")
  const [orderBy, setOrderBy] = useState("recent")
  const [onlyPR, setOnlyPR] = useState(false)

  const toggleCategory = (value: string) => {
    setCategories(prev =>
      prev.includes(value)
        ? prev.filter(c => c !== value)
        : [...prev, value]
    )
  }

  const clearFilters = () => {
    setPeriod("30d")
    setCategories([])
    setDuration("any")
    setOrderBy("recent")
    setOnlyPR(false)
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
          <Button variant="ghost" onClick={clearFilters}>
            Clear
          </Button>
          <Button className="rounded-xl px-6">
            Apply filters
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label>Period</Label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Category</Label>
          <ToggleGroup
            type="multiple"
            value={categories}
            onValueChange={setCategories}
            className="flex flex-wrap gap-2"
            >
            {["Push", "Pull", "Legs", "Upper", "Full"].map(cat => (
                <ToggleGroupItem
                    key={cat}
                    value={cat}
                    className="
                        rounded-full px-3 py-1 text-xs border
                        data-[state=on]:bg-primary
                        data-[state=on]:text-primary-foreground
                        hover:bg-muted/60
                        transition-colors
                    "
                    >
                    {cat}
                </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label>Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="short">Short</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="long">Long</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Order by</Label>
            <Select value={orderBy} onValueChange={setOrderBy}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most recent</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
          <div className="flex flex-col">
            <span className="text-sm font-medium">Only PR workouts</span>
            <span className="text-xs text-muted-foreground">
              Show only personal records
            </span>
          </div>
          <Switch checked={onlyPR} onCheckedChange={setOnlyPR} />
        </div>
      </div>
    </Modal>
  )
}

export default FilterModal