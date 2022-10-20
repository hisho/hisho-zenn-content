---
title: "チャットの送信機能の実装"
---

# チャットの送信機能の実装

## チャットページの作成

```shell
$ mkdir -p src/pages/chat
$ touch src/pages/chat/index.tsx
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
│       ├── component
│       │   └── AuthGuard
│       │       └── AuthGuard.tsx
│       └── provider
│           └── AuthProvider.tsx
├── lib
│   └── firebase
│       └── firebase.ts
└── pages
    ├── _app.tsx
+    ├── chat
+    │   └── index.tsx
    ├── index.tsx
    ├── signin
    │   └── index.tsx
    └── signup
        └── index.tsx
```

```tsx:src/pages/chat/index.tsx
export const Page = () => {
  return <div>chat page</div>
}

export default Page
```

[http://localhost:3000/chat](http://localhost:3000/chat)にアクセス

![](/images/firebase-chat-book/chapter10-01.png)

## UIを整える

```diff tsx:src/pages/chat/index.tsx
+import {
+  Button,
+  chakra,
+  Container,
+  Heading,
+  Input,
+  Spacer,
+} from '@chakra-ui/react'

export const Page = () => {
-  return <div>chat page</div>
+  return (
+    <Container py={14}>
+      <Heading>チャット</Heading>
+      <Spacer height={8} aria-hidden />
+      <chakra.form display={'flex'} gap={2}>
+        <Input />
+        <Button type={'submit'}>送信</Button>
+      </chakra.form>
+    </Container>
+  )
}

export default Page
```

![](/images/firebase-chat-book/chapter10-02.png)

## フォームの状態を管理する

```diff tsx:src/pages/chat/index.tsx
import {
  Button,
  chakra,
  Container,
  Heading,
  Input,
  Spacer,
} from '@chakra-ui/react'
+import { FormEvent, useState } from 'react'

export const Page = () => {
+  const [message, setMessage] = useState<string>('')

+  const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
+    console.log({ message })
+    e.preventDefault()
+  }

  return (
    <Container py={14}>
      <Heading>チャット</Heading>
      <Spacer height={8} aria-hidden />
-      <chakra.form display={'flex'} gap={2}>
-        <Input />
+      <chakra.form display={'flex'} gap={2} onSubmit={handleSendMessage}>
+        <Input value={message} onChange={(e) => setMessage(e.target.value)} />
        <Button type={'submit'}>送信</Button>
      </chakra.form>
    </Container>
  )
}

export default Page
```

下記の画面のように`送信`を押してconsoleで入力した値が確認できたらOKです

![](/images/firebase-chat-book/chapter10-03.png)

## Firebase Realtime Databaseにデータを書き込む

https://firebase.google.com/docs/database/admin/save-data?hl=ja

```ts
import { getDatabase, push, ref } from '@firebase/database'
import { FirebaseError } from '@firebase/util'

const sendChatMessage = async () => {
  try {
    const db = getDatabase()
    const dbRef = ref(db, 'chat')
    await push(dbRef, {
      message: 'message',
    })
  } catch (e) {
    if (e instanceof FirebaseError) {
      console.log(e)
    }
  }
}
```

## 組み込み

```diff tsx:src/pages/chat/index.tsx
import {
  Button,
  chakra,
  Container,
  Heading,
  Input,
  Spacer,
} from '@chakra-ui/react'
import { FormEvent, useState } from 'react'
+import { getDatabase, push, ref } from '@firebase/database'
+import { FirebaseError } from '@firebase/util'

export const Page = () => {
  const [message, setMessage] = useState<string>('')

-  const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
-    console.log({ message })
+  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
+    try {
+      const db = getDatabase()
+      const dbRef = ref(db, 'chat')
+      await push(dbRef, {
+        message,
+      })
+      setMessage('')
+    } catch (e) {
+      if (e instanceof FirebaseError) {
+        console.log(e)
+      }
+    }
  }

  return (
    <Container py={14}>
      <Heading>チャット</Heading>
      <Spacer height={8} aria-hidden />
      <chakra.form display={'flex'} gap={2} onSubmit={handleSendMessage}>
        <Input value={message} onChange={(e) => setMessage(e.target.value)} />
        <Button type={'submit'}>送信</Button>
      </chakra.form>
    </Container>
  )
}

export default Page
```

![](/images/firebase-chat-book/chapter10-04.gif)

https://github.com/hisho/zenn-firebase-chat-demo/tree/chapter10