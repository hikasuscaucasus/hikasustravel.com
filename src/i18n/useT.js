import { useContext } from 'react'
import { I18nContext } from './I18nContext'

export default function useT() {
  const { translations } = useContext(I18nContext)

  return function t(key, params) {
    let value = translations[key] ?? key
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.split(`{${k}}`).join(v)
      })
    }
    return value
  }
}
