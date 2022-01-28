---
title: "reactでよく使う型"
emoji: "🏷"
type: "tech"
topics: ["react","typescript"]
published: false
---

## Hooks

```ts
import {useState} from 'react'

export const useHoge = (initialValue: Parameters<typeof useState>[0]) => {
  const [flag,setFlag] = useState(initialValue)
  
  return {
    flag,
    setFlag
  }
}

type useHogeType = typeof useHoge
type useHogeResult = ReturnType<useHogeType>
type useHogeParameter = Parameters<useHogeType>[0] 
```

## Component

```tsx
type MyComponentProps = {
  children: ReactElemnt
}

const MyComponent = ({children}:MyComponentProps) => (
  <>{children}</>
)


```