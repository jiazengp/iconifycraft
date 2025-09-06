import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWebFonts,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  theme: {
    colors: {
      // CSS 变量颜色定义
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      card: {
        DEFAULT: 'hsl(var(--card))',
        foreground: 'hsl(var(--card-foreground))',
      },
      popover: {
        DEFAULT: 'hsl(var(--popover))',
        foreground: 'hsl(var(--popover-foreground))',
      },
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))',
      },
      secondary: {
        DEFAULT: 'hsl(var(--secondary))',
        foreground: 'hsl(var(--secondary-foreground))',
      },
      muted: {
        DEFAULT: 'hsl(var(--muted))',
        foreground: 'hsl(var(--muted-foreground))',
      },
      accent: {
        DEFAULT: 'hsl(var(--accent))',
        foreground: 'hsl(var(--accent-foreground))',
      },
      destructive: {
        DEFAULT: 'hsl(var(--destructive))',
        foreground: 'hsl(var(--destructive-foreground))',
      },
      border: 'hsl(var(--border))',
      input: 'hsl(var(--input))',
      ring: 'hsl(var(--ring))',
      // Minecraft 品牌色
      minecraft: {
        green: {
          primary: 'hsl(var(--minecraft-green-primary))',
          dark: 'hsl(var(--minecraft-green-dark))',
          light: 'hsl(var(--minecraft-green-light))',
        },
        brown: {
          dark: 'hsl(var(--minecraft-brown-dark))',
          medium: 'hsl(var(--minecraft-brown-medium))',
          light: 'hsl(var(--minecraft-brown-light))',
        },
      },
      // 骨架屏颜色
      skeleton: {
        bg: 'hsl(var(--skeleton-bg))',
        highlight: 'hsl(var(--skeleton-highlight))',
      },
    },
  },
  shortcuts: [
    ['btn', 'px-4 py-2 rounded-lg inline-flex items-center justify-center bg-primary text-primary-foreground cursor-pointer outline-none hover:bg-primary/90 disabled:cursor-default disabled:opacity-50 font-medium text-sm transition-all duration-200'],
    ['btn-secondary', 'px-4 py-2 rounded-lg inline-flex items-center justify-center bg-secondary text-secondary-foreground cursor-pointer outline-none hover:bg-secondary/80 disabled:cursor-default disabled:opacity-50 font-medium text-sm transition-all duration-200 border border-border'],
    ['btn-ghost', 'px-4 py-2 rounded-lg inline-flex items-center justify-center text-foreground cursor-pointer outline-none hover:bg-accent hover:text-accent-foreground disabled:cursor-default disabled:opacity-50 font-medium text-sm transition-all duration-200'],
    ['icon-btn', 'inline-flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer select-none text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground'],
    ['icon-btn-no-bg', 'inline-flex items-center justify-center min-w-8 h-8 px-2 rounded-lg cursor-pointer select-none text-muted-foreground transition-colors duration-200 hover:text-primary'],
    ['card', 'bg-card text-card-foreground rounded-xl border border-border shadow-sm'],
    ['input', 'px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all duration-200'],
    ['input-modern', 'w-full border border-border/60 rounded-lg bg-background/80 backdrop-blur-sm px-4 py-3 text-foreground text-sm font-medium transition-all duration-300 ease-in-out placeholder:text-muted-foreground/80 hover:border-primary/80 hover:bg-background hover:shadow-sm hover:scale-[1.01] focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none focus:shadow-lg focus:scale-[1.01] active:scale-100'],
    ['textarea-modern', 'w-full border border-border/60 rounded-lg bg-background/80 backdrop-blur-sm px-4 py-3 text-foreground text-sm font-medium transition-all duration-300 ease-in-out placeholder:text-muted-foreground/80 hover:border-primary/80 hover:bg-background hover:shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none focus:shadow-lg resize-none'],
    ['select-modern', 'w-full cursor-pointer appearance-none border border-border/60 rounded-lg bg-background/80 backdrop-blur-sm px-4 py-3 text-foreground text-sm font-medium transition-all duration-300 ease-in-out hover:border-primary/80 hover:bg-background hover:shadow-sm hover:scale-[1.01] focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none focus:shadow-lg focus:scale-[1.01] active:scale-100'],
    ['select-wrapper', 'relative group'],
    ['select-arrow', 'pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4'],
    ['select-icon', 'text-muted-foreground transition-all duration-200 transform group-hover:text-primary'],
    ['search-input', 'border border-border/60 rounded-lg bg-background/90 backdrop-blur-sm py-2 pl-10 pr-10 text-sm font-medium transition-all duration-300 ease-in-out text-foreground placeholder:text-muted-foreground/80 hover:border-primary/80 hover:bg-background hover:shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none focus:shadow-lg relative z-1'],
  ],
  presets: [
    presetWind3(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: ['Noto Sans', 'Noto Sans SC'],
        serif: ['Source Han Serif SC', 'Noto Serif CJK SC', 'Noto Serif SC', 'Source Han Serif'],
        mono: ['Noto Sans Mono', 'JetBrains Mono'],
      },
      // processors: createLocalFontProcessor(),
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  safelist: 'prose prose-sm m-auto text-left'.split(' '),
})
