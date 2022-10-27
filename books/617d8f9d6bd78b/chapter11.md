---
title: "[実装編]チャットの取得機能を実装しよう"
---

# チャットの取得機能を実装しよう
チャットの送信機能ができたので、最後にチャットを取得する機能を実装しましょう！


## Firebase Realtime Databaseからデータを取得しよう

https://firebase.google.com/docs/database/web/lists-of-data?hl=ja#listen_for_child_events

## onChildAddedを使ってデータを取得、監視しよう
データの取得、監視を行うには、`onChildAdded`を使います。
`onChildAdded`の型定義を見てみると`query`と`callback`を引数に取り、`Unsubscribe`を返す関数になっています。

```ts:public.d.ts
export declare function onChildAdded(query: Query, callback: (snapshot: DataSnapshot, previousChildName?: string | null) => unknown, cancelCallback?: (error: Error) => unknown): Unsubscribe;
```

### Queryとは
https://firebase.google.com/docs/database/web/lists-of-data#sorting_and_filtering_data
> Realtime Database の Query クラスを使用して、キー、値、または子の値で並べ替えられたデータを取得できます。また、並べ替えられた結果を、特定の件数またはある範囲のキーや値に限定するようフィルタリングできます。

簡単に説明すると、取得したいデータを絞り込むためのクエリを作成して渡すことができます。   
今回は並び替えはしないので、`firebase.database.Reference`のインスタンスをそのまま渡します。

### snapshotとは
Firebaseのデータは`snapshot`という形で取得できます。   
`snapshot.val()`で値を取得できますが、型は`any`になるので注意が必要です。

## onChildAddedの使い方
`onAuthStateChanged`と同じく変更状態を`subscribe`するので、`useEffect`の`return`で`unsubscribe`する必要があります。


```tsx:onChildAdded
import { useEffect, useState } from 'react'
import { getDatabase, onChildAdded, ref } from '@firebase/database'
import { FirebaseError } from '@firebase/util'

export const App = () => {
  const [chats, setChats] = useState<{ message: string }[]>([])

  useEffect(() => {
    try {
      const db = getDatabase()
      const dbRef = ref(db, 'chat')
      return onChildAdded(dbRef, (snapshot) => {
        const value = snapshot.val()
        setChats((prev) => [...prev, { message: value.message }])
      })
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.error(e)
      }
      return
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
```

## チャットページのUIを整えよう
チャットページのUIを整えましょう。
また、ダミーデータを作成しUIが正しく動くかも一緒に確認しましょう。

```diff tsx:src/pages/chat.tsx
import {
+  Avatar,
+  Box,
  Button,
  chakra,
  Container,
+  Flex,
  Heading,
  Input,
  Spacer,
+  Text,
} from '@chakra-ui/react'
import { FormEvent, useState } from 'react'
import { getDatabase, push, ref } from '@firebase/database'
import { FirebaseError } from '@firebase/util'

+const _message = '確認用メッセージです。'
+const _messages = [...Array(10)].map((_, i) => _message.repeat(i + 1))
+
+type MessageProps = {
+  message: string
+}
+
+const Message = ({ message }: MessageProps) => {
+  return (
+    <Flex alignItems={'start'}>
+      <Avatar />
+      <Box ml={2}>
+        <Text bgColor={'gray.200'} rounded={'md'} px={2} py={1}>
+          {message}
+        </Text>
+      </Box>
+    </Flex>
+  )
+}

export const Page = () => {
  const [message, setMessage] = useState<string>('')

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const db = getDatabase()
      const dbRef = ref(db, 'chat')
      await push(dbRef, {
        message,
      })
      setMessage('')
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.log(e)
      }
    }
  }

  return (
    <Container py={14}>
      <Heading>チャット</Heading>
-      <Spacer height={8} aria-hidden />
+      <Spacer height={4} aria-hidden />
+      <Flex flexDirection={'column'} overflowY={'auto'} gap={2} height={400}>
+        {_messages.map((message, index) => (
+          <Message message={message} key={`ChatMessage_${index}`} />
+        ))}
+      </Flex>
+      <Spacer height={2} aria-hidden />
      <chakra.form display={'flex'} gap={2} onSubmit={handleSendMessage}>
        <Input value={message} onChange={(e) => setMessage(e.target.value)} />
        <Button type={'submit'}>送信</Button>
      </chakra.form>
    </Container>
  )
}

export default Page
```


![](/images/firebase-chat-book/chapter11-01.gif)

## onChildAddedとチャットを紐付けよう
チャットを送信すると、送信したチャットがリアルタイムで表示されるようにしましょう。
ダミーデータも削除します。

```diff tsx:src/pages/chat/index.tsx
import {
  Avatar,
  Box,
  Button,
  chakra,
  Container,
  Flex,
  Heading,
  Input,
  Spacer,
  Text,
} from '@chakra-ui/react'
-import { FormEvent, useState } from 'react'
-import { getDatabase, push, ref } from '@firebase/database'
+import { FormEvent, useEffect, useState } from 'react'
+import { getDatabase, onChildAdded, push, ref } from '@firebase/database'
import { FirebaseError } from '@firebase/util'

+const _message = '確認用メッセージです。'
+const _messages = [...Array(10)].map((_, i) => _message.repeat(i + 1))

type MessageProps = {
  message: string
}

const Message = ({ message }: MessageProps) => {
  return (
    <Flex alignItems={'start'}>
      <Avatar />
      <Box ml={2}>
        <Text bgColor={'gray.200'} rounded={'md'} px={2} py={1}>
          {message}
        </Text>
      </Box>
    </Flex>
  )
}

export const Page = () => {
  const [message, setMessage] = useState<string>('')

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const db = getDatabase()
      const dbRef = ref(db, 'chat')
      await push(dbRef, {
        message,
      })
      setMessage('')
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.log(e)
      }
    }
  }

+  const [chats, setChats] = useState<{ message: string }[]>([])
+
+  useEffect(() => {
+    try {
+      const db = getDatabase()
+      const dbRef = ref(db, 'chat')
+      return onChildAdded(dbRef, (snapshot) => {
+        const message = String(snapshot.val()['message'] ?? '')
+        setChats((prev) => [...prev, { message }])
+      })
+    } catch (e) {
+      if (e instanceof FirebaseError) {
+        console.error(e)
+      }
+      return
+    }
+    // eslint-disable-next-line react-hooks/exhaustive-deps
+  }, [])

  return (
    <Container py={14}>
      <Heading>チャット</Heading>
      <Spacer height={4} aria-hidden />
      <Flex flexDirection={'column'} overflowY={'auto'} gap={2} height={400}>
-        {_messages.map((message, index) => (
-          <Message message={message} key={`ChatMessage_${index}`} />
+        {chats.map((chat, index) => (
+          <Message message={chat.message} key={`ChatMessage_${index}`} />
        ))}
      </Flex>
      <Spacer height={2} aria-hidden />
      <chakra.form display={'flex'} gap={2} onSubmit={handleSendMessage}>
        <Input value={message} onChange={(e) => setMessage(e.target.value)} />
        <Button type={'submit'}>送信</Button>
      </chakra.form>
    </Container>
  )
}

export default Page
```

![](/images/firebase-chat-book/chapter11-02.gif)

## Firebaseのセキュリティルールを変更しよう
デフォルトのままでは、誰でもデータを書き込めてしまいます。
そこで、Firebaseのセキュリティルールを変更して、認証済みのユーザーのみがチャットを送信できるようにしましょう。

```json
{
  "rules": {
    ".write": false,
    ".read": false,
    "chat": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

## チャットができているか確認しよう
ブラウザを2つ開き各々でログインした状態にして、チャットを送信してみましょう。
リアルタイムでチャットが受信できていることが確認できます。

![](/images/firebase-chat-book/chapter11-03.gif)

以上でチャットの取得機能の作成は完了です。
お疲れさまでした。


## チャットの取得機能が完了した地点のブランチ
https://github.com/hisho/zenn-firebase-chat-demo/tree/chapter11