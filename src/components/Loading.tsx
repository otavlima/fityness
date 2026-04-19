import { Loader2 } from "lucide-react"

const Loading = ({text, isCol}: { text: string, isCol: boolean }) => (
  <div className="flex items-center justify-center h-screen">
    <div className={`flex ${isCol ? 'flex-col' : 'flex-row'} items-center gap-4`}>
      <Loader2 className="w-8 h-8 animate-spin" />
      <p className="text-sm animate-pulse">{text}...</p>
    </div>
  </div>
)

export default Loading