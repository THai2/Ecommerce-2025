import React, { useLayoutEffect, useState } from 'react'
import useSettingStore from '@/hooks/use-setting-store'
import { ClientSetting } from '@/types'

export default function AppInitializer({
  setting,
  children,
}: {
  setting: ClientSetting
  children: React.ReactNode
}) {
  const [isInitialized, setIsInitialized] = useState(false)
  
  useLayoutEffect(() => {
    // Set state trước khi component render lần đầu
    useSettingStore.setState({
      setting,
    })
    setIsInitialized(true)
  }, [setting])

  // Không render children cho đến khi đã initialize
  if (!isInitialized) {
    return null // hoặc loading spinner
  }

  return <>{children}</>
}