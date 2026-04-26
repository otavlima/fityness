import { format } from "date-fns"
import { enUS } from "date-fns/locale"
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Modal } from '@/components/Modal'
import { useState } from "react"
import { cn } from "@/lib/utils"

import { CalendarIcon, Clock, CalendarDays } from 'lucide-react'


const ScheduleModal = ({isModalOpen, setIsModalOpen}: {isModalOpen: boolean, setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>}) => {
    const today = new Date(2026, 3, 18)
    const [startDate, setStartDate] = useState<Date | undefined>(today)
    const [endDate, setEndDate] = useState<Date | undefined>()
    const [isRepeating, setIsRepeating] = useState(false)
    const [frequency, setFrequency] = useState('weekly')
    const [selectedDays, setSelectedDays] = useState<string[]>([])
    const [endCondition, setEndCondition] = useState('after_x')
    const [occurrences, setOccurrences] = useState('8')
    
    const showStartDate = !isRepeating || (isRepeating && frequency !== 'specific_days');
    const isSpecificDays = isRepeating && frequency === 'specific_days';

    const WEEKDAYS_SHORT = [
        { id: '0', label: 'S' }, { id: '1', label: 'M' }, { id: '2', label: 'T' }, 
        { id: '3', label: 'W' }, { id: '4', label: 'T' }, { id: '5', label: 'F' }, { id: '6', label: 'S' }
    ]
    return (
        <Modal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            title='Schedule workout'
            description='Select a workout and define your training schedule.'
            icon={<CalendarDays size={20} />}
            footer={
              <div className="flex w-full justify-end gap-3 pt-4 border-t border-border mt-2">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button className="px-6 gap-2">Schedule</Button>
              </div>
            }
          >
            <div className="flex flex-col gap-5 py-2">
              <div className="flex flex-col gap-2">
                <Label className="text-sm">Workout</Label>
                <Select>
                  <SelectTrigger className="w-full h-11 rounded-lg font-normal">
                    <SelectValue placeholder="Select an existing workout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="push">Push Day</SelectItem>
                    <SelectItem value="pull">Pull Day</SelectItem>
                    <SelectItem value="legs">Legs Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {showStartDate && (
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm">{isRepeating ? "Starts on" : "Date"}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full h-11 justify-start text-left font-normal rounded-lg">
                          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {startDate ? format(startDate, "dd MMM yyyy", { locale: enUS }) : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                        <CalendarComponent mode="single" selected={startDate} onSelect={setStartDate} />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
                <div className={cn("flex flex-col gap-2", isSpecificDays ? "col-span-2" : "col-span-1")}>
                  <Label className="text-sm">Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="time" defaultValue="18:30" className="h-11 rounded-lg pl-9 font-normal" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4 border border-border rounded-xl p-4 bg-muted/5">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <Label className="text-base font-normal">Repeat workout</Label>
                    <span className="text-xs text-muted-foreground">Automatically schedule on a fixed frequency.</span>
                  </div>
                  <Switch checked={isRepeating} onCheckedChange={setIsRepeating} />
                </div>
                {isRepeating && (
                  <div className="flex flex-col gap-4 pt-4 border-t border-border mt-1">
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm">Frequency</Label>
                      <Select value={frequency} onValueChange={setFrequency}>
                        <SelectTrigger className="h-11 rounded-lg font-normal">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly (same day)</SelectItem>
                          <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                          <SelectItem value="specific_days">Specific days of the week</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {isSpecificDays && (
                      <div className="flex flex-col gap-2">
                        <Label className="text-sm">Days of the week</Label>
                        <div className="flex items-center justify-between gap-1">
                          {WEEKDAYS_SHORT.map((day) => (
                            <button
                              key={day.id}
                              onClick={() => setSelectedDays(prev => prev.includes(day.id) ? prev.filter(d => d !== day.id) : [...prev, day.id])}
                              className={cn(
                                "flex-1 h-10 rounded-lg border text-sm transition-all",
                                selectedDays.includes(day.id) ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:bg-muted"
                              )}
                            >
                              {day.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm">Ends</Label>
                      <Select value={endCondition} onValueChange={setEndCondition}>
                        <SelectTrigger className="h-11 rounded-lg font-normal">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="after_x">After X occurrences</SelectItem>
                          <SelectItem value="on_date">On a specific date</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                      {endCondition === 'after_x' && (
                        <Input type="number" value={occurrences} onChange={(e) => setOccurrences(e.target.value)} className="h-11 rounded-lg font-normal" />
                      )}
                      {endCondition === 'on_date' && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full h-11 justify-start text-left font-normal rounded-lg">
                              <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                              {endDate ? format(endDate, "dd MMM yyyy", { locale: enUS }) : <span>Pick end date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                            <CalendarComponent mode="single" selected={endDate} onSelect={setEndDate} />
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm">Notes (optional)</Label>
                <Textarea placeholder="Focus on form, hydration..." className="resize-none min-h-[80px] rounded-xl font-normal" />
              </div>
            </div>
        </Modal>
    )
}

export default ScheduleModal