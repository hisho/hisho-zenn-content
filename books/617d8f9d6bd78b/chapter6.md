---
title: "サインイン機能の実装"
---

# サインイン

## サインインページの作成

```shell
$ mkdir -p src/pages/signin
$ touch src/pages/signin/index.tsx
```

```diff text
src
├── constant
│   └── env.ts
├── lib
│   └── firebase
│       └── firebase.ts
└── pages
    ├── _app.tsx
    ├── index.tsx
+   ├── signin
+   │   └── index.tsx
    └── signup
        └── index.tsx
```

```ts:src/pages/signin/index.tsx
export const Page = () => {
  return <div>sign in</div>
}

export default Page
```

![](/images/firebase-chat-book/chapter6-01.png)

## UIを整える
サインアップと同じ

```diff tsx:src/pages/signin/index.tsx
+import {
+  Box,
+  Button,
+  Center,
+  chakra,
+  Container,
+  FormControl,
+  FormLabel,
+  Grid,
+  Heading,
+  Input,
+  Spacer,
+} from '@chakra-ui/react'

export const Page = () => {
-  return <div>sign in</div>
+  return (
+    <Container py={14}>
+      <Heading>サインイン</Heading>
+      <chakra.form>
+        <Spacer height={8} aria-hidden />
+        <Grid gap={4}>
+          <Box display={'contents'}>
+            <FormControl>
+              <FormLabel>メールアドレス</FormLabel>
+              <Input type={'email'} />
+            </FormControl>
+            <FormControl>
+              <FormLabel>パスワード</FormLabel>
+              <Input type={'password'} />
+            </FormControl>
+          </Box>
+        </Grid>
+        <Spacer height={4} aria-hidden />
+        <Center>
+          <Button type={'submit'}>ログイン</Button>
+        </Center>
+      </chakra.form>
+    </Container>
+  )
}

export default Page
```
![](/images/firebase-chat-book/chapter6-02.png)

## フォームの状態を管理する

```diff tsx:src/pages/signin/index.tsx
import {
  Box,
  Button,
  Center,
  chakra,
  Container,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Input,
  Spacer,
} from '@chakra-ui/react'
+import { FormEvent, useState } from 'react'

export const Page = () => {
+  const [email, setEmail] = useState<string>('')
+  const [password, setPassword] = useState<string>('')
+
+  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
+    console.log({ email, password })
+    e.preventDefault()
+  }

  return (
    <Container py={14}>
      <Heading>サインイン</Heading>
-      <chakra.form>
+      <chakra.form onSubmit={handleSubmit}>
        <Spacer height={8} aria-hidden />
        <Grid gap={4}>
          <Box display={'contents'}>
            <FormControl>
              <FormLabel>メールアドレス</FormLabel>
-              <Input type={'email'} />
+              <Input
+                type={'email'}
+                name={'email'}
+                value={email}
+                onChange={(e) => {
+                  setEmail(e.target.value)
+                }}
+              />
            </FormControl>
            <FormControl>
              <FormLabel>パスワード</FormLabel>
-              <Input type={'password'} />
+              <Input
+                type={'password'}
+                name={'password'}
+                value={password}
+                onChange={(e) => {
+                  setPassword(e.target.value)
+                }}
+              />
            </FormControl>
          </Box>
        </Grid>
        <Spacer height={4} aria-hidden />
        <Center>
          <Button type={'submit'}>ログイン</Button>
        </Center>
      </chakra.form>
    </Container>
  )
}

export default Page
```

下記の画面のようにアカウントを作成を押してconsoleで入力した値が確認できたらOKです

![](/images/firebase-chat-book/chapter6-03.png)

## Firebase Authenticationを使ってサインインする

### Firebase Authenticationのサインインの概要

https://firebase.google.com/docs/auth/web/password-auth?hl=ja#sign_in_a_user_with_an_email_address_and_password
```ts
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { FirebaseError } from '@firebase/util'

const signIn = async () => {
  try {
    const auth = getAuth()
    await signInWithEmailAndPassword(auth, email, password)
  } catch (e) {
    if (e instanceof FirebaseError) {
      console.log(e)
    }
  }
}
```

## Firebase Authenticationのログインの実装

```diff tsx:src/pages/signin/index.tsx
import {
  Box,
  Button,
  Center,
  chakra,
  Container,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Input,
  Spacer,
} from '@chakra-ui/react'
import { FormEvent, useState } from 'react'
+import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
+import { FirebaseError } from '@firebase/util'

export const Page = () => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')

-  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
-    console.log({ email, password })
+  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
+    try {
+      const auth = getAuth()
+      await signInWithEmailAndPassword(auth, email, password)
+      setEmail('')
+      setPassword('')
+    } catch (e) {
+      if (e instanceof FirebaseError) {
+        console.log(e)
+      }
+    }
  }

  return (
    <Container py={14}>
      <Heading>サインイン</Heading>
      <chakra.form onSubmit={handleSubmit}>
        <Spacer height={8} aria-hidden />
        <Grid gap={4}>
          <Box display={'contents'}>
            <FormControl>
              <FormLabel>メールアドレス</FormLabel>
              <Input
                type={'email'}
                name={'email'}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel>パスワード</FormLabel>
              <Input
                type={'password'}
                name={'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                }}
              />
            </FormControl>
          </Box>
        </Grid>
        <Spacer height={4} aria-hidden />
        <Center>
          <Button type={'submit'}>ログイン</Button>
        </Center>
      </chakra.form>
    </Container>
  )
}

export default Page
```

コンソールにエラーがでなければOKです！

## UXを改善する

```diff tsx
import {
  Box,
  Button,
  Center,
  chakra,
  Container,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Input,
  Spacer,
+  useToast,
} from '@chakra-ui/react'
import { FormEvent, useState } from 'react'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { FirebaseError } from '@firebase/util'

export const Page = () => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
+  const [isLoading, setIsLoading] = useState<boolean>(false)
+  const toast = useToast()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
+    setIsLoading(true)
    e.preventDefault()
    try {
      const auth = getAuth()
      await signInWithEmailAndPassword(auth, email, password)
      setEmail('')
      setPassword('')
+      toast({
+        title: 'ログインしました。',
+        status: 'success',
+        position: 'top',
+      })
+      //TODO: ログイン後のページに遷移の処理を書く
    } catch (e) {
+      toast({
+        title: 'エラーが発生しました。',
+        status: 'error',
+        position: 'top',
+      })
      if (e instanceof FirebaseError) {
        console.log(e)
      }
+    } finally {
+      setIsLoading(false)
+    }
  }

  return (
    <Container py={14}>
      <Heading>サインイン</Heading>
      <chakra.form onSubmit={handleSubmit}>
        <Spacer height={8} aria-hidden />
        <Grid gap={4}>
          <Box display={'contents'}>
            <FormControl>
              <FormLabel>メールアドレス</FormLabel>
              <Input
                type={'email'}
                name={'email'}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel>パスワード</FormLabel>
              <Input
                type={'password'}
                name={'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                }}
              />
            </FormControl>
          </Box>
        </Grid>
        <Spacer height={4} aria-hidden />
        <Center>
-          <Button type={'submit'}>ログイン</Button>
+          <Button type={'submit'} isLoading={isLoading}>
+            ログイン
+          </Button>
        </Center>
      </chakra.form>
    </Container>
  )
}

export default Page
```


![](/images/firebase-chat-book/chapter6-04.gif)


https://github.com/hisho/zenn-firebase-chat-demo/tree/chapter6