import { useId } from 'react'
import { Trophy, } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import Header from '@/components/Header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Field,
  FieldDescription,
  FieldTitle
} from '@/components/ui/field'

const chartDataMock = [
  { value: 65 }, { value: 72 }, { value: 70 }, { value: 78 },
  { value: 80 }, { value: 85 }, { value: 84 }, { value: 90 },
]

const recentRecordsMock = [
  { exercise: 'Bench press', performance: '82.5kg × 5', date: 'Today' },
  { exercise: 'Squat', performance: '120kg × 3', date: 'Yesterday' },
  { exercise: 'Bent-over row', performance: '75kg × 8', date: 'Apr 16' },
]

const muscleDistributionMock = [
  { group: 'Chest', percentage: 22 },
  { group: 'Back', percentage: 26 },
  { group: 'Legs', percentage: 32 },
  { group: 'Shoulders', percentage: 12 },
  { group: 'Arms', percentage: 8 },
]

interface Big4CardProps {
  title: string
  currentValue: number
  baseValue: number
  percentage: string
  data: { value: number }[]
}

const Big4Card = ({ title, currentValue, baseValue, percentage, data }: Big4CardProps) => {
  const uniqueId = useId().replace(/:/g, "")

  return (
    <Card className="overflow-hidden rounded-2xl border border-border/40 bg-background shadow-none">
      <div className="flex flex-row items-start justify-between p-4 pb-2">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight">{currentValue}kg</span>
            <span className="text-xs text-muted-foreground">from {baseValue}kg</span>
          </div>
        </div>

        <Badge className="rounded-full border-none bg-foreground px-2.5 py-0.5 text-[10px] font-medium text-background hover:bg-foreground">
          +{percentage}
        </Badge>
      </div>

      <div className="pointer-events-none h-14 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="currentColor" stopOpacity={0.15} />
                <stop offset="95%" stopColor="currentColor" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="currentColor"
              strokeWidth={1.5}
              fill={`url(#gradient-${uniqueId})`}
              className="text-foreground/40"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

const RecentRecordItem = ({
  exercise,
  performance,
  date,
}: {
  exercise: string
  performance: string
  date: string
}) => {
  return (
    <div className="flex items-center justify-between border-b border-border/40 py-3.5 first:pt-0 last:border-0 last:pb-0">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
          <Trophy className="h-4 w-4" />
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold">{exercise}</span>
          <span className="text-xs font-medium text-muted-foreground">
            {performance}
          </span>
        </div>
      </div>

      <span className="text-xs font-medium text-muted-foreground">
        {date}
      </span>
    </div>
  )
}

const Progress = () => {
  return (
    <Header>
      <div className="flex flex-1 w-full justify-center px-4">
        <div className="flex flex-col gap-4 w-full max-w-5xl">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <Field className="flex flex-col gap-1">
              <FieldDescription className="text-xs font-semibold tracking-widest uppercase">
                Analytics
              </FieldDescription>
              <FieldTitle className="text-3xl font-bold tracking-tight">
                Progress
              </FieldTitle>
              <FieldDescription>
                Track your load progression and consistency.
              </FieldDescription>
            </Field>

            <div className="flex rounded-full border border-border/40 bg-card/40 p-1">
              {['1M', '3M', '6M', '1Y'].map((p) => (
                <button
                  key={p}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                    p === '3M'
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 font-bold md:grid-cols-3">
            <Card className="rounded-3xl border-none bg-brand-gradient p-5 text-background">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wider opacity-60">
                Strength (Big 4)
              </p>
              <h2 className="text-4xl tracking-tight">
                +19%
              </h2>
              <p className="mt-1 text-sm font-medium opacity-60">
                average global progression
              </p>
            </Card>

            <Card className="rounded-3xl border-border/40 bg-card/40 p-5">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Volume
              </p>
              <h2 className="text-4xl tracking-tight">
                412t
              </h2>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                lifted in 90 days
              </p>
            </Card>

            <Card className="rounded-3xl border-border/40 bg-card/40 p-5">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Consistency
              </p>
              <h2 className="text-4xl tracking-tight">
                8/10
              </h2>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                active training weeks
              </p>
            </Card>
          </div>

          <Card className="space-y-6 rounded-3xl border-border/40 bg-card/40 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight">Big 4 — Loads</h3>
              <Badge variant="outline" className="rounded-full border-border/60 bg-background px-3 py-1 text-[10px] font-medium text-muted-foreground">
                Last 8 weeks
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
              <Big4Card title="Bench Press" currentValue={82.5} baseValue={70} percentage="17.8%" data={chartDataMock} />
              <Big4Card title="Squat" currentValue={120} baseValue={100} percentage="20%" data={chartDataMock} />
              <Big4Card title="Deadlift" currentValue={140} baseValue={120} percentage="16.6%" data={chartDataMock} />
              <Big4Card title="Overhead Press" currentValue={55} baseValue={45} percentage="22.2%" data={chartDataMock} />
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <Card className="flex flex-col gap-6 rounded-3xl border-border/40 bg-card/40 p-6">
              <h3 className="text-lg font-semibold tracking-tight">Recent Records</h3>

              <div className="flex flex-col">
                {recentRecordsMock.map((record, i) => (
                  <RecentRecordItem key={i} {...record} />
                ))}
              </div>
            </Card>

            <Card className="flex flex-col gap-6 rounded-3xl border-border/40 bg-card/40 p-6">
              <h3 className="text-lg font-semibold tracking-tight">Muscle Distribution</h3>

              <div className="flex flex-col gap-4">
                {muscleDistributionMock.map((item, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-foreground/90">{item.group}</span>
                      <span className="font-medium text-muted-foreground">{item.percentage}%</span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                      <div 
                        className="h-full rounded-full bg-foreground" 
                        style={{ width: `${item.percentage}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

          </div>

        </div>
      </div>
    </Header>
  )
}

export default Progress