---
title: "[実装編]チャットの送信機能を実装しよう"
---

# チャットの送信機能を実装しよう
ついにチャットの送信の機能の実装です。

## Firebase Realtime Databaseにデータを書き込もう

https://firebase.google.com/docs/database/admin/save-data?hl=ja
https://firebase.google.com/docs/database/web/lists-of-data?hl=ja#listen_for_child_events

### pushを使ってデータを書き込もう
データベースでデータの読み書きを行うには3ステップが必要です。
大まかな流れは以下になります。

1. `firebase.database`のインスタンスを取得する`const db = getDatabase()`
2. 取得したdatabaseを紐付ける`ref(db, 'path')`
3. `push`または`set`でデータを書き込む

#### `push` vs `set`
`push`はデータを書き込む際に自動的にキーを生成してくれます。   
自動的にユニークキーを生成してくれるので、今回は`push`を使用します。

```ts:Firebaseにデータ書き込み
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

今回は`chat`というパスにデータを書き込んでいます。
```ts
const dbRef = ref(db, 'chat')
```
そして保存する値は`message`というキーに`message`という値を保存しています。
```json
{
  "message": "message"
}
```

### pushのエラー処理
`catch`した引数にunknownのerrorを受け取れるので、`instanceof`で`FirebaseError`かどうかを判定してあげる必要があります。
今回は`console.log`でエラーを表示していますが、実際にはエラーを表示するUIを作成してあげる必要があります。

```ts:pushのエラー処理
try {
} catch (e) {   
  if (e instanceof FirebaseError) {
    console.log(e)
  }
}
```

## チャットページを作成しよう
Firebaseへのデータの書き込み方法がわかったので、実際にチャットページを作成していきます。

```shell:ターミナル
$ mkdir -p src/pages/chat
$ touch src/pages/chat/index.tsx
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

[http://localhost:3000/chat](http://localhost:3000/chat)にアクセスしてみると下記の画面が表示されます。

![](/images/firebase-chat-book/chapter10-01.png)

## チャットページのUIを整えよう
一旦送信ボタンだけ作成してみましょう。

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

## チャットページフォームの状態を管理しよう
このままでは`メッセージ`が送信できないので、フォームの状態を管理する必要があります。
ここでは一旦`useState`を使ってフォームの状態を管理していきます。

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


## データベースへの書き込みをフォームと紐付けよう
`handleSendMessage`の中身を先程の`push`にしましょう
また、成功した場合に`form`の値をリセットするのを忘れないようにしましょう

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

### データが書き込まれたか確認しよう
Firebase Realtime Databaseのコンソールを開いてみましょう。   
下記の動画のように書き込まれていれば成功です。

![](/images/firebase-chat-book/chapter10-04.gif)

以上でチャットの送信機能の作成は完了です。
お疲れさまでした。

## チャットの送信機能が完了した地点のブランチ

https://github.com/hisho/zenn-firebase-chat-demo/tree/chapter10