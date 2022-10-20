---
title: "サインアウト機能の実装"
---

# サインアウト

## UIを整える


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

## Firebase Authenticationを使ってサインアウトする

https://firebase.google.com/docs/auth/web/password-auth?hl=ja#next_steps

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

## Firebase Authenticationのサインアウトの実装

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

UXを改善する

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

https://github.com/hisho/zenn-firebase-chat-demo/tree/chapter8