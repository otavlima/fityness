import Header from '@/components/Header'
import {
  Field,
  FieldDescription,
  FieldTitle
} from '@/components/ui/field'

const Progress = () => {
  return (
    <Header>
      <div className="flex flex-1 w-full justify-center px-4">
        <div className="flex flex-col gap-4 w-full max-w-5xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <Field className="flex flex-col gap-1">
              <FieldDescription className="text-xs font-semibold tracking-widest uppercase">
                Analysis
              </FieldDescription>
              <FieldTitle className="text-3xl font-bold tracking-tight">
                Progress
              </FieldTitle>
              <FieldDescription>
                See how your loads evolve week after week.
              </FieldDescription>
            </Field>
          </div>
        </div>
      </div>
    </Header>
  )
}

export default Progress