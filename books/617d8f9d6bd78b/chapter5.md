---
title: "サインアップ機能の実装"
---

# サインアップ
まず最初に 、サインアップ機能を実装しましょう！   
今回はメールアドレスとパスワードを使った認証方法で実装していきます。   
大まかな流れは下記のようになります。   
1. createUserWithEmailAndPasswordでアカウント作成
2. sendEmailVerificationで作成したメールアドレスに確認メールを送信

## Firebase Authenticationを使ってサインアップする
https://firebase.google.com/docs/auth/web/password-auth?hl=ja#create_a_password-based_account

## createUserWithEmailAndPasswordを使ってサインアップしよう
Firebase Authenticationでメールアドレスとパスワードを使った認証を行うには、`createUserWithEmailAndPassword`を使います。   
`createUserWithEmailAndPassword`の型定義を見てみると`auth`と`email`と`password`を引数に取り、`Promise<UserCredential>`を返す関数になっています。
```ts:auth-public.d.ts
export declare function createUserWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
```

返り値の`UserCredential`は、`user`と`providerId`と`operationType`を持っています。

```ts:auth-public.d.ts
export declare interface UserCredential {
    /**
     * The user authenticated by this credential.
     */
    user: User;
    /**
     * The provider which was used to authenticate the user.
     */
    providerId: string | null;
    /**
     * The type of operation which was used to authenticate the user (such as sign-in or link).
     */
    operationType: typeof OperationType[keyof typeof OperationType];
}
```

### createUserWithEmailAndPasswordの使い方

`createUserWithEmailAndPassword`は返り値が`Primise`なので`async関数`の中で`await`してあげる必要があります。


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

### createUserWithEmailAndPasswordのエラー処理
`catch`した引数にunknownのerrorを受け取れるので、`instanceof`で`FirebaseError`かどうかを判定してあげる必要があります。   
今回は`console.log`でエラーを表示していますが、実際にはエラーを表示するUIを作成してあげる必要があります。

```ts:createUserWithEmailAndPasswordのエラー処理
try {
} catch (e) {   
  if (e instanceof FirebaseError) {
    console.log(e)
  }
}
```

## Firebase Authenticationを使って確認メールを送信しよう
https://firebase.google.com/docs/auth/web/manage-users?hl=ja#send_a_user_a_verification_email

### sendEmailVerificationを使って確認メールを送信しよう
`createUserWithEmailAndPassword`でアカウントを作成した後にメールアドレスが正しいものか確認する必要があるので、`sendEmailVerification`を使ってメールアドレスに確認メールを送信します。   
`sendEmailVerification`の型定義を見てみると`user`と`actionCodeSettings(option)`を引数に取り、`Promise<void>`を返す関数になっています。

```ts:auth-public.d.ts
export declare function sendEmailVerification(user: User, actionCodeSettings?: ActionCodeSettings | null): Promise<void>;
```

ここで先程の`createUserWithEmailAndPassword`の返り値の`userCredential`から`user`を取得し`sendEmailVerification`に渡してあげることでユーザーに紐付いているメールアドレスに確認メールが送信されます。

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


## サインアップページの作成
Firebaseのサインアップ方法がわかったので、実際にサインアップページを作成していきます。

```shell:ターミナル
$ mkdir -p src/pages/signup
$ touch src/pages/signup/index.tsx
```

```diff shell:ディレクトリ
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

## サインアップページのUIを整えましょう
`Chakra UI`を使って最低限の見た目を作成します。

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

## サインアップページフォームの状態を管理しよう
このままでは`メールアドレス`と`パスワード`が送信できないので、フォームの状態を管理する必要があります。   
ここでは一旦`useState`を使ってフォームの状態を管理していきます。


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

### Firebase Authenticationとサインアップフォームを紐付けよう
`handleSubmit`の中身を先程の`createUserWithEmailAndPassword`と`sendEmailVerification`にしましょう   
`form`の値をリセットするのを忘れないようにしましょう

```diff tsx

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

### Firebaseの`Authentication`のコンソールを確認しよう
自分が送信したメールアドレスが増えていればOKです
![](/images/firebase-chat-book/chapter5-04.gif)

### メールアドレスの確認をしよう
メールボックスを確認してFirebaseからメールが来ていないか確認しましょう。   
規定な場合は迷惑メールに分類されている可能性もあります。
![](/images/firebase-chat-book/chapter5-05.png)
![](/images/firebase-chat-book/chapter5-06.png)

## サインアップページのUX改善しよう
このままでは流石に成功したのか失敗したのか分からないのでChakra UIのtoastを使ってUXを改善しましょう   
Chakra UIのButtonコンポーネントは`isLoading`を受け取ってローディングのアニメーションを表示してくれるのでそれも使いましょう
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

以上でサインアップページの作成は完了です。
お疲れさまでした。

## サインアップが完了した地点のブランチ

https://github.com/hisho/zenn-firebase-chat-demo/tree/chapter5