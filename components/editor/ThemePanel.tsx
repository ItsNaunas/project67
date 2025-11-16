import { ChangeEvent } from 'react'
import Input from '@/components/ui/Input'
import { useLayoutEditor } from './LayoutEditorContext'

export function ThemePanel() {
  const { layout, updateThemeTokens } = useLayoutEditor()

  if (!layout) {
    return null
  }

  const { palette, typography, spacing } = layout.theme

  return (
    <div className="space-y-6 rounded-xl border border-white/10 bg-white/5 p-6">
      <header>
        <p className="text-xs uppercase tracking-wide text-white/40">Theme</p>
        <h3 className="text-lg font-semibold text-white">Global Styles</h3>
        <p className="text-xs text-white/50">
          Update colors, fonts, and spacing to instantly refresh the entire layout.
        </p>
      </header>

      <section className="space-y-4">
        <h4 className="text-sm font-semibold text-white/70">Color Palette</h4>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(palette).map(([key, value]) => (
            <label key={key} className="space-y-2 text-xs text-white/60">
              <span className="font-medium capitalize text-white/70">{toLabel(key)}</span>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={value}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    updateThemeTokens({
                      palette: {
                        [key]: event.target.value,
                      },
                    })
                  }
                  className="h-10 w-16 cursor-pointer border border-white/10 bg-transparent p-1"
                />
                <Input
                  value={value}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    updateThemeTokens({
                      palette: {
                        [key]: event.target.value,
                      },
                    })
                  }
                  className="flex-1"
                />
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h4 className="text-sm font-semibold text-white/70">Typography</h4>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(typography).map(([key, value]) => (
            <label key={key} className="space-y-2 text-xs text-white/60">
              <span className="font-medium capitalize text-white/70">{toLabel(key)}</span>
              <Input
                value={value as string}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  updateThemeTokens({
                    typography: {
                      [key]: event.target.value,
                    },
                  })
                }
              />
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h4 className="text-sm font-semibold text-white/70">Spacing</h4>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(spacing).map(([key, value]) => (
            <label key={key} className="space-y-2 text-xs text-white/60">
              <span className="font-medium capitalize text-white/70">{toLabel(key)}</span>
              <Input
                type="number"
                value={value}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  updateThemeTokens({
                    spacing: {
                      [key]: Number(event.target.value),
                    },
                  })
                }
              />
            </label>
          ))}
        </div>
      </section>
    </div>
  )
}

function toLabel(value: string) {
  return value.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase())
}


