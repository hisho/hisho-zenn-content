---
title: "AuthGuardの実装"
---

# AuthGuardの実装
AuthGuardとは、認証しているか判定して認証していない場合はサインイン画面に遷移させたりする機能のことです。   
今回はAuthGuardを実装して、認証していない場合はサインイン画面に遷移させるようにします。


## AuthGuard コンポーネントの作成しよう

```shell:ターミナル
$ mkdir -p src/feature/auth/component/AuthGuard
$ touch src/feature/auth/component/AuthGuard/AuthGuard.tsx
```

```diff shell:ディレクトリ
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
`const { user } = useAuthContext()`からユーザー情報を取得して、ユーザーの状態に応じて処理を分岐させています。

### userが`undefined`の場合
userが`undefined`の場合は認証が完了していないということになります。   
そのため、`undefined`の場合は認証が完了するまでローディング画面を表示させます。

```tsx
if (typeof user === 'undefined') {
  return <Box>読み込み中...</Box>
}
```

### userが`null`の場合
userがnullの場合は認証していないということになります。    
認証していない場合はサインイン画面に遷移させます。

```tsx
if (user === null) {
  push('/signin')
  return null
}
```

### userが`User`の場合
userが`User`の場合は認証しているということになります。   
認証済なので、そのまま`children`を表示するようにします。

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

## AuthGuardを`src/pages/index.tsx`に追加しよう
ひとまず、AuthGuardが正しく動作しているか確認するためににトップページにAuthGuardを追加してみます。

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
サインアウト中は一瞬`読み込み中...`が表示された後サインイン画面に遷移します。
![](/images/firebase-chat-book/chapter9-01.gif)


### サインイン中
サインイン中は一瞬`読み込み中...`が表示された後そのままトップページが表示されます。
![](/images/firebase-chat-book/chapter9-02.gif)

以上でAuthGuard機能の作成は完了です。
お疲れさまでした。

## AuthGuardが完了した地点のブランチ
https://github.com/hisho/zenn-firebase-chat-demo/tree/chapter9