---
title: "サインアウト機能を実装しよう"
---

# サインアウト機能を実装しよう
最後に、サインアウト機能を実装しましょう！
サインインをしたらサインアウトもしたいですよね

## Firebase Authenticationを使ってサインアウトしよう

https://firebase.google.com/docs/auth/web/password-auth?hl=ja#next_steps

## signOutを使ってサインアウトしよう
Firebase Authenticationサインアウトを行うには、`signOut`を使います。
`signOut`の型定義を見てみると`auth`を引数に取り、`Promise<vold>`を返す関数になっています。

```ts:auth-public.d.ts
export declare function signOut(auth: Auth): Promise<void>;
```

## signOutの使い方
`signOut`は返り値が`Promise`なので`async関数`の中で`await`してあげる必要があります。
```ts:signOut
import { getAuth, signOut } from 'firebase/auth'
import { FirebaseError } from '@firebase/util'

const signOut = async () => {
  try {
    const auth = getAuth()
    await signOut(auth)
  } catch (e) {
    if (e instanceof FirebaseError) {
      console.log(e)
    }
  }
}
```

## signOutのエラーを処理

`catch`した引数にunknown型のerrorを受け取れるので、`instanceof`で`FirebaseError`かどうかを判定してあげる必要があります。
今回は`console.log`でエラーを表示していますが、実際にはエラーを表示するUIを作成してあげる必要があります。

## サインアウトようのHeaderのUIを整えよう
サインイン中はサインアウトできるボタンのUIを表示するようにします。

```diff tsx:src/component/Header/Header.tsx
-import { chakra, Container, Heading } from '@chakra-ui/react'
+import { Button, chakra, Container, Heading } from '@chakra-ui/react'
import { useAuthContext } from '@src/feature/auth/provider/AuthProvider'

export const Header = () => {
  const { user } = useAuthContext()

  return (
    <chakra.header py={4} bgColor={'blue.600'}>
      <Container maxW={'container.lg'}>
        <Heading color={'white'}>
-          {user ? 'ログイン中' : 'ログアウト中'}
+          {user ? (
+            <Button colorScheme={'teal'}>サインアウト</Button>
+          ) : (
+            'ログアウト中'
+          )}
        </Heading>
      </Container>
    </chakra.header>
  )
}
```

![](/images/firebase-chat-book/chapter8-01.png)

## Firebase Authenticationとサインアウトを紐付けよう
サインアウトボタンを押すと、Firebase Authenticationのサインアウトが行われるようにします。

```diff tsx:src/component/Header/Header.tsx
import { Button, chakra, Container, Heading } from '@chakra-ui/react'
import { useAuthContext } from '@src/feature/auth/provider/AuthProvider'
+import { FirebaseError } from '@firebase/util'
+import { getAuth, signOut } from 'firebase/auth'

export const Header = () => {
  const { user } = useAuthContext()
+  const handleSignOut = async () => {
+    try {
+      const auth = getAuth()
+      await signOut(auth)
+    } catch (e) {
+      if (e instanceof FirebaseError) {
+        console.log(e)
+      }
+    }
+  }

  return (
    <chakra.header py={4} bgColor={'blue.600'}>
      <Container maxW={'container.lg'}>
        <Heading color={'white'}>
          {user ? (
-            <Button colorScheme={'teal'} >
+            <Button colorScheme={'teal'} onClick={handleSignOut}>
              サインアウト
            </Button>
          ) : (
            'ログアウト中'
          )}
        </Heading>
      </Container>
    </chakra.header>
  )
}

```

![](/images/firebase-chat-book/chapter8-02.gif)

## サインアウトページのUX改善しよう
このままでは流石に成功したのか失敗したのか分からないのでChakra UIのtoastを使ってUXを改善しましょう   
サインアウトが成功するとサインインページに遷移させたいので合わせて実装します。


```diff tsx:src/component/Header/Header.tsx
-import { Button, chakra, Container, Heading, useToast } from '@chakra-ui/react'
+import { useAuthContext } from '@src/feature/auth/provider/AuthProvider'
import { FirebaseError } from '@firebase/util'
import { getAuth, signOut } from 'firebase/auth'
+import { useState } from 'react'
+import { useRouter } from 'next/router'

export const Header = () => {
  const { user } = useAuthContext()
+  const [isLoading, setIsLoading] = useState<boolean>(false)
+  const toast = useToast()
+  const { push } = useRouter()

  const handleSignOut = async () => {
+    setIsLoading(true)
    try {
      const auth = getAuth()
      await signOut(auth)
+      toast({
+        title: 'ログアウトしました。',
+        status: 'success',
+        position: 'top',
+      })
+      push('/signin')
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.log(e)
      }
+    } finally {
+      setIsLoading(false)
+    }
  }

  return (
    <chakra.header py={4} bgColor={'blue.600'}>
      <Container maxW={'container.lg'}>
        <Heading color={'white'}>
          {user ? (
-            <Button colorScheme={'teal'} onClick={handleSignOut}>
+            <Button
+              colorScheme={'teal'}
+              onClick={handleSignOut}
+              isLoading={isLoading}
+            >
              サインアウト
            </Button>
          ) : (
            'ログアウト中'
          )}
        </Heading>
      </Container>
    </chakra.header>
  )
}
```


![](/images/firebase-chat-book/chapter8-03.gif)

以上でサインアウト機能の作成は完了です。
お疲れさまでした。

## サインアウトが完了した地点のブランチ

https://github.com/hisho/zenn-firebase-chat-demo/tree/chapter8