/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1890ff',
        success: '#52c41a',
        warning: '#faad14',
        error: '#ff4d4f',
        // 虚拟办公室主题色
        'office-dark': '#1a2332',
        'office-darker': '#0f1419',
        'office-panel': '#2a3f5f',
        'office-blue': '#3D7FFF',
        'office-cyan': '#4ECDC4',
        'office-yellow': '#FFD93D',
        'office-pink': '#FF6B9D',
        'office-green': '#A8E6CF',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // 避免与Ant Design冲突
  },
}
