---
title: "サインイン機能の実装"
---

# サインイン
次にに 、サインイン機能を実装しましょう！   
アカウントの作成ができたので、アカウントを使ってサインインできるようにします。
大まかな流れは下記のようになります。

1. signInWithEmailAndPasswordでログイン


## Firebase Authenticationを使ってサインインする

https://firebase.google.com/docs/auth/web/password-auth?hl=ja#sign_in_a_user_with_an_email_address_and_password

## signInWithEmailAndPasswordを使ってサインインしよう
Firebase Authenticationでメールアドレスとパスワードを使ったサインインを行うには、signInWithEmailAndPasswordを使います。
`signInWithEmailAndPassword`の型定義を見てみると`auth`と`email`と`password`を引数に取り、`Promise<UserCredential>`を返す関数になっています。   
返り値は`createUserWithEmailAndPassword`と同じですね

```ts:auth-public.d.ts
export declare function signInWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
```

### signInWithEmailAndPasswordの使い方
`signInWithEmailAndPassword`は返り値が`Promise`なので`async関数`の中で`await`してあげる必要があります。

```ts:signInWithEmailAndPassword
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

### signInWithEmailAndPasswordのエラーを処理
`catch`した引数にunknown型のerrorを受け取れるので、`instanceof`で`FirebaseError`かどうかを判定してあげる必要があります。
今回は`console.log`でエラーを表示していますが、実際にはエラーを表示するUIを作成してあげる必要があります。

## サインインページの作成
Firebaseのサインイン方法がわかったので、実際にサインインページを作成していきます。

```shell:ターミナル
$ mkdir -p src/pages/signin
$ touch src/pages/signin/index.tsx
```

```diff text:ディレクトリ
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

## サインインページのUIを整えましょう
Chakra UIを使って最低限の見た目を作成します。   
一旦サインアップと全く同じです。

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

## サインインページフォームの状態を管理しよう
このままでは`メールアドレス`と`パスワード`が送信できないので、フォームの状態を管理する必要があります。   
ここでは一旦`useState`を使ってフォームの状態を管理していきます。   
ここもサインアップページと同じです。

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

下記の画面のよう`にログイン`を押してconsoleで入力した値が確認できたらOKです

![](/images/firebase-chat-book/chapter6-03.png)

## Firebase Authenticationとサインインフォームを紐付けよう
`handleSubmit`の中身を先程の`signInWithEmailAndPassword`にしましょう
また、成功した場合に`form`の値をリセットするのを忘れないようにしましょう

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

## サインインページのUX改善しよう
このままでは流石に成功したのか失敗したのか分からないのでChakra UIのtoastを使ってUXを改善しましょう   
Chakra UIのButtonコンポーネントは`isLoading`を受け取ってローディングのアニメーションを表示してくれるのでそれも使いましょう   
ここもサインアップページと同じです。

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

以上でサインインページの作成は完了です。
お疲れさまでした。

## サインインが完了した地点のブランチ

https://github.com/hisho/zenn-firebase-chat-demo/tree/chapter6