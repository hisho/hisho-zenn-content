---
title: "サインアップ機能の実装"
---

# サインアップ

## サインアップページの作成

```shell
$ mkdir -p src/pages/signup
$ touch src/pages/signup/index.tsx
```

```diff shell
src
├── constant
│   └── env.ts
├── lib
│   └── firebase
│       └── firebase.ts
└── pages
    ├── _app.tsx
    ├── index.tsx
+   └── signup
+       └── index.tsx
```

```tsx:src/pages/signup/index.tsx
export const Page = () => {
  return <div>sign up page</div>
}

export default Page
```

![](/images/firebase-chat-book/chapter5-01.png)

## UIを整える


```diff tsx:src/pages/signup/index.tsx
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
-  return <div>sign up page</div>
+  return (
+    <Container py={14}>
+      <Heading>サインアップ</Heading>
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
+          <Button type={'submit'}>アカウントを作成</Button>
+        </Center>
+      </chakra.form>
+    </Container>
+  )
}

export default Page
```

![](/images/firebase-chat-book/chapter5-02.png)

## フォームの状態を管理する

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
} from '@chakra-ui/react'
+import { FormEvent, useState } from 'react'

export const Page = () => {
+  const [email, setEmail] = useState<string>('')
+  const [password, setPassword] = useState<string>('')

+  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
+    console.log({ email, password })
+    e.preventDefault()
+  }

  return (
    <Container py={14}>
      <Heading>サインアップ</Heading>
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
          <Button type={'submit'}>アカウントを作成</Button>
        </Center>
      </chakra.form>
    </Container>
  )
}

export default Page
```

下記の画面のように`アカウントを作成`を押してconsoleで入力した値が確認できたらOKです

![](/images/firebase-chat-book/chapter5-03.png)

## Firebase Authenticationを使ってサインアップする

### Firebase Authenticationのアカウント作成の概要
https://firebase.google.com/docs/auth/web/password-auth?hl=ja#create_a_password-based_account

```ts:createUserWithEmailAndPassword
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth'
import { FirebaseError } from '@firebase/util'

const signUp = async () => {
  try {
    const auth = getAuth()
    await createUserWithEmailAndPassword(auth, email, password)
  } catch (e) {
    if (e instanceof FirebaseError) {
      console.log(e)
    }
  }
}
```

`sendEmailVerification`を使ってメールアドレスを確認するメールを送信する必要がある
https://firebase.google.com/docs/auth/web/manage-users?hl=ja#send_a_user_a_verification_email

```diff ts:createUserWithEmailAndPasswordWithSendEmailVerification
import { sendEmailVerification, getAuth } from 'firebase/auth'
import { FirebaseError } from '@firebase/util'

const signUp = async () => {
  try {
    const auth = getAuth()
-    await createUserWithEmailAndPassword(auth, email, password)
+    const userCredential = await createUserWithEmailAndPassword(
+      auth,
+      email,
+      password
+    )
+    await sendEmailVerification(userCredential.user)
  } catch (e) {
    if (e instanceof FirebaseError) {
      console.log(e)
    }
  }
}

```

### Firebase Authenticationのアカウント作成の実装

```diff tsx:src/pages/signup/index.tsx
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
+import {
+  createUserWithEmailAndPassword,
+  getAuth,
+  sendEmailVerification,
+} from 'firebase/auth'
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
+      const userCredential = await createUserWithEmailAndPassword(
+        auth,
+        email,
+        password
+      )
+      await sendEmailVerification(userCredential.user)
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
      <Heading>サインアップ</Heading>
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
          <Button type={'submit'}>アカウントを作成</Button>
        </Center>
      </chakra.form>
    </Container>
  )
}

export default Page
```


![](/images/firebase-chat-book/chapter5-04.gif)
![](/images/firebase-chat-book/chapter5-05.png)
![](/images/firebase-chat-book/chapter5-06.png)

## UX改善する
loadingとトーストを追加した
https://chakra-ui.com/docs/components/toast/usage

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
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
} from 'firebase/auth'
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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      await sendEmailVerification(userCredential.user)
      setEmail('')
      setPassword('')
+      toast({
+        title: '確認メールを送信しました。',
+        status: 'success',
+        position: 'top',
+      })
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
      <Heading>サインアップ</Heading>
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
-          <Button type={'submit'}>
+          <Button type={'submit'} isLoading={isLoading}>
            アカウントを作成
          </Button>
        </Center>
      </chakra.form>
    </Container>
  )
}

export default Page
```

![](/images/firebase-chat-book/chapter5-07.gif)


https://github.com/hisho/zenn-firebase-chat-demo/tree/chapter5