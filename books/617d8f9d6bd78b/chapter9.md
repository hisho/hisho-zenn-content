---
title: "AuthGuardの実装"
---

# AuthGuardの実装

## AuthGuardとは
認証しているか判定して色々するやつ

## AuthGuard コンポーネントの作成

```shell
$ mkdir -p src/feature/auth/component/AuthGuard
$ touch src/feature/auth/component/AuthGuard/AuthGuard.tsx
```

```diff shell
src
├── component
│   └── Header
│       └── Header.tsx
├── constant
│   └── env.ts
├── feature
│   └── auth
+│       ├── component
+│       │   └── AuthGuard
+│       │       └── AuthGuard.tsx
│       └── provider
│           └── AuthProvider.tsx
├── lib
│   └── firebase
│       └── firebase.ts
└── pages
    ├── _app.tsx
    ├── index.tsx
    ├── signin
    │   └── index.tsx
    └── signup
        └── index.tsx
```

### AuthGuard コンポーネントの概要

```tsx:src/feature/auth/component/AuthGuard/AuthGuard.tsx
import { useAuthContext } from '@src/feature/auth/provider/AuthProvider'
import { useRouter } from 'next/router'
import type { ReactNode } from 'react'
import { Box } from '@chakra-ui/react'

type Props = {
  children: ReactNode
}

export const AuthGuard = ({ children }: Props) => {
  const { user } = useAuthContext()
  const { push } = useRouter()

  if (typeof user === 'undefined') {
    return <Box>読み込み中...</Box>
  }

  if (user === null) {
    push('/signin')
    return null
  }

  return <>{children}</>
}
```

## AuthGuardを`src/pages/index.tsx`に追加

```diff tsx:src/pages/index.tsx
import type { NextPage } from 'next'
-import { Box, Heading } from '@chakra-ui/react'
+import { Heading } from '@chakra-ui/react'
+import { AuthGuard } from '@src/feature/auth/component/AuthGuard/AuthGuard'

const Page: NextPage = () => {
  return (
-    <Box>
+    <AuthGuard>
      <Heading>Chakra UI</Heading>
-    </Box>
+    </AuthGuard>
  )
}

export default Page
```

### サインアウト中
![](/images/firebase-chat-book/chapter9-01.gif)


### サインイン中
![](/images/firebase-chat-book/chapter9-02.gif)

https://github.com/hisho/zenn-firebase-chat-demo/tree/chapter9