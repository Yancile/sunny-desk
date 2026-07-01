import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore(
  'theme',
  () => {
    const primaryColor = ref('#1890ff')
    const darkMode = ref(false)

    const setPrimaryColor = (color) => {
      primaryColor.value = color
      document.documentElement.style.setProperty('--primary-color', color)
    }

    const toggleDarkMode = () => {
      darkMode.value = !darkMode.value
      if (darkMode.value) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    return {
      primaryColor,
      darkMode,
      setPrimaryColor,
      toggleDarkMode,
    }
  },
  {
    persist: true,
  }
)