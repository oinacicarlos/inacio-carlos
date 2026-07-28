'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'

export default function ToolBackToHub() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setVisible(params.get('origem') === 'hub')
  }, [])

  if (!visible) return null

  return (
    <div className="tool-back-to-hub">
      <a href="/hub">
        <ArrowLeft size={16} strokeWidth={2.2} aria-hidden="true" />
        Voltar ao hub
      </a>
    </div>
  )
}
