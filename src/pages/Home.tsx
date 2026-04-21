import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Play, 
  ArrowRight, 
  Flame, 
  Trophy, 
  Dumbbell, 
  TrendingUp, 
  Timer,
  ArrowUpRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const Home = () => {
  const { user } = useAuth()

  const metrics = [
    { icon: Dumbbell, badge: '+24%', value: '18', label: 'Treinos no mês' },
    { icon: TrendingUp, badge: '+8%', value: '12.4t', label: 'Volume total' },
    { icon: Flame, badge: 'Recorde!', value: '12d', label: 'Streak ativo' },
    { icon: Timer, badge: '-3m', value: '54m', label: 'Tempo médio' }
  ]

  const todayExercises = [
    { id: 1, name: 'Supino reto', detail: '4 × 10 · 62.5kg', increment: '+2.5kg' },
    { id: 2, name: 'Crucifixo inclinado', detail: '3 × 12 · 20kg', increment: '+0kg' },
    { id: 3, name: 'Tríceps corda', detail: '4 × 12 · 32kg', increment: '+2kg' },
    { id: 4, name: 'Tríceps francês', detail: '3 × 10 · 18kg', increment: '+1kg' },
  ]

  const recentActivity = [
    { title: 'Pernas — Quad foco', time: '1h 12m', vol: '4.2t', tags: ['2 PR'], date: 'Ontem' },
    { title: 'Costas & Bíceps', time: '58m', vol: '3.1t', tags: ['1 PR'], date: 'Há 2 dias' },
    { title: 'Push Day', time: '1h 04m', vol: '3.8t', tags: [], date: 'Há 4 dias' },
  ]

  return (
    <Header>
      <div className="flex flex-col w-full px-4 md:px-10 gap-8 pb-10">
        <Card className="relative w-full bg-card-gradient border-border shadow-lg rounded-[2.5rem] overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-[0.1] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(circle_at_top_right,var(--foreground),transparent)]" />
          <CardContent className="p-8 md:p-12 flex flex-col gap-8 relative z-10">
            <div className="flex items-center bg-primary/10 border border-primary/20 p-2 px-4 w-fit rounded-full">
              <span className="flex items-center gap-2 text-[11px] text-primary font-bold tracking-widest uppercase">
                <Flame className="w-4 h-4 fill-current text-orange-400" />
                Streak 12 Dias
              </span>
            </div>
            <div className="space-y-4 lg:pr-[300px]">
              <h1 className="text-foreground text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]">
                Morning, {user?.displayName}.<br />
                <span className="text-muted-foreground">
                  Today's workout is Chest & Triceps.
                </span>
              </h1>
              <p className="text-muted-foreground text-sm md:text-lg font-medium max-w-[500px]">
                4 exercises · 16 sets · ~55 minutes estimated.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="default">
                <Play className="fill-current w-4 h-4 mr-2" />
                Start Workout
              </Button>
              <Button size="lg" variant="outline">
                View weekly plan <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
            <div className="relative lg:absolute lg:bottom-12 lg:right-12 mt-4 lg:mt-0 w-full lg:w-[260px]">
              <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase">
                    This Week
                  </span>
                  <Trophy className="w-5 h-5 text-yellow-500/80" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-foreground tracking-tighter">4</span>
                  <span className="text-base font-medium text-muted-foreground">/ 6 treinos</span>
                </div>
                <div className="flex gap-1.5 mt-6">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${
                        i < 4 ? 'bg-primary' : 'bg-muted/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-col w-full gap-4 md:grid md:grid-cols-4">
          {metrics.map((metric, index) => (
            <Card
              key={index}
              className="w-full rounded-[1.8rem] bg-card border border-border shadow-sm"
            >
              <CardContent className="p-6 flex flex-col justify-between h-full min-h-[160px]">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 flex items-center justify-center bg-secondary/50 rounded-2xl">
                    <metric.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <span className="bg-secondary/80 text-foreground text-[10px] font-bold px-2.5 py-1 rounded-lg">
                    {metric.badge}
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-4xl font-bold tracking-tighter text-foreground">
                    {metric.value}
                  </h3>
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                    {metric.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 rounded-[2.5rem] border-border bg-card shadow-sm">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase">
                    Treino de Hoje
                  </span>
                  <h2 className="text-3xl font-bold mt-2">Peito & Tríceps</h2>
                </div>
                <div className="bg-secondary/50 px-4 py-1.5 rounded-full text-xs font-bold border border-border">
                  Push · A
                </div>
              </div>

              <div className="space-y-3">
                {todayExercises.map((ex) => (
                  <div key={ex.id} className="group flex items-center justify-between p-4 rounded-2xl bg-secondary/20 border border-transparent hover:border-primary/20 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center font-bold text-sm border border-border">
                        {ex.id}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{ex.name}</p>
                        <p className="text-xs text-muted-foreground">{ex.detail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-md">
                        {ex.increment}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-border/50">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-xs font-bold">Progresso do treino</p>
                    <p className="text-xs text-muted-foreground">2 de 4 exercícios</p>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="h-1.5 w-12 rounded-full bg-primary" />
                    <div className="h-1.5 w-12 rounded-full bg-primary" />
                    <div className="h-1.5 w-12 rounded-full bg-muted/20" />
                    <div className="h-1.5 w-12 rounded-full bg-muted/20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[2.5rem] border-border bg-card shadow-sm flex flex-col">
            <CardContent className="p-8 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold">Atividade recente</h2>
                <Button variant="link" className="text-muted-foreground text-xs p-0 h-auto">Ver tudo</Button>
              </div>
              <div className="space-y-8 flex-1">
                {recentActivity.map((item, i) => (
                  <div key={i} className="relative pl-6 border-l-2 border-muted/20 last:border-0 pb-2">
                    <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-foreground" />
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-sm leading-none">{item.title}</p>
                      <span className="text-[10px] text-muted-foreground">{item.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
                      <span>{item.time}</span>
                      <span>•</span>
                      <span>{item.vol}</span>
                      {item.tags.map(tag => (
                        <span key={tag} className="bg-foreground text-background px-1.5 py-0.5 rounded text-[9px] font-black tracking-tighter">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/workouts" className="flex items-center justify-center  gap-2 w-full mt-8 border-dashed rounded-2xl h-14 border-2 hover:bg-secondary/50 transition-colors">
                <Dumbbell size={16}/>
                Manage workouts
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Header>
  )
}

export default Home