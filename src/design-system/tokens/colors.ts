export type ColorScale = Record<string, string>

export const colors = {
  void: {
    DEFAULT: '#0A0A0A',
    lighter: '#121212',
    lightest: '#1A1A1A',
  },
  spark: {
    DEFAULT: '#00F0FF',
    dim: '#00BCD4',
    glow: 'rgba(0, 240, 255, 0.25)',
  },
  smoke: {
    DEFAULT: '#2A2A2A',
    light: '#3A3A3A',
    lighter: '#4A4A4A',
  },
  mist: {
    DEFAULT: '#FFFFFF',
    fog: '#9B9B9B',
    ash: '#6B6B6B',
  },
  gold: {
    DEFAULT: '#FFB800',
    dim: '#FF9800',
    glow: 'rgba(255, 184, 0, 0.2)',
  },
  blood: {
    DEFAULT: '#FF006E',
    dim: '#E91E63',
    glow: 'rgba(255, 0, 110, 0.2)',
  },
  phosphor: {
    DEFAULT: '#39FF14',
    dim: '#00E676',
    glow: 'rgba(57, 255, 20, 0.2)',
  },
  violet: {
    DEFAULT: '#9D4EDD',
    glow: 'rgba(157, 78, 221, 0.2)',
  },
  ember: {
    DEFAULT: '#FF4500',
    glow: 'rgba(255, 69, 0, 0.2)',
  },
  gradients: {
    spark: 'linear-gradient(135deg, #00F0FF 0%, #9D4EDD 100%)',
    gold: 'linear-gradient(135deg, #FFB800 0%, #FF4500 100%)',
    void: 'linear-gradient(180deg, #0A0A0A 0%, #121212 100%)',
    glowSpark: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.25) 0%, transparent 70%)',
  },
} as const

export const colorsRGB = {
  void: '10 10 10',
  'void-lighter': '18 18 18',
  'void-lightest': '26 26 26',
  spark: '0 240 255',
  'spark-dim': '0 188 212',
  smoke: '42 42 42',
  'smoke-light': '58 58 58',
  'smoke-lighter': '74 74 74',
  mist: '255 255 255',
  fog: '155 155 155',
  ash: '107 107 107',
  gold: '255 184 0',
  blood: '255 0 110',
  phosphor: '57 255 20',
  violet: '157 78 221',
  ember: '255 69 0',
} as const

export type Colors = typeof colors
