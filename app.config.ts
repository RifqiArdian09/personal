export default defineAppConfig({
  ui: {
    primary: 'teal',
    gray: 'slate',
    button: {
      default: {
        size: 'md',
        color: 'primary'
      },
      rounded: 'rounded-xl',
      font: 'font-semibold'
    },
    input: {
      base: 'w-full',
      default: {
        size: 'md',
        color: 'white'
      },
      rounded: 'rounded-xl',
      padding: {
        md: 'px-4 py-2.5'
      },
      color: {
        white: {
          outline: 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-primary-500'
        }
      }
    },
    textarea: {
      base: 'w-full',
      default: {
        size: 'md',
        color: 'white'
      },
      rounded: 'rounded-xl',
      color: {
        white: {
          outline: 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-primary-500'
        }
      }
    },
    card: {
      rounded: 'rounded-2xl',
      shadow: 'shadow-sm',
      background: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-800'
    },
    select: {
      base: 'w-full',
      default: {
        size: 'md'
      }
    },
    formGroup: {
      label: {
        base: 'block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5'
      },
      help: 'text-xs text-slate-500 dark:text-slate-400 mt-1.5',
      error: 'text-xs text-red-500 mt-1.5'
    }
  }
})
