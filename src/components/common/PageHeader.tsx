import { Button } from '@/components/ui/button'

interface Props {
  title: string
  buttonText?: string
  onClick?: () => void
  icon?: React.ReactNode
}

export function PageHeader({ title, buttonText, onClick, icon }: Props) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">{title}</h1>

      {buttonText && (
        <Button onClick={onClick}>
          {icon}
          {buttonText}
        </Button>
      )}
    </div>
  )
}