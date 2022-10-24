---
title: "認証状態を監視する"
---

# 認証状態の監視しよう
サインアップ、サインイン機能が実装できたら、認証状態を取得したいと思います。   
そこで、認証状態を監視する機能を実装していきます。   
大まかな流れは下記のようになります。

1. onAuthStateChangedを使って認証状態を監視する



## Firebase Authenticationを使って認証状態を取得しよう
https://firebase.google.com/docs/auth/web/manage-users?hl=ja#get_the_currently_signed-in_user

## onAuthStateChangedを使って認証状態を監視しよう
Firebase Authenticationで認証状態を監視するには、`onAuthStateChanged`を使います。
`onAuthStateChanged`の型定義を見てみると`auth`と`nextOrObserver`と`error`と`completed`を引数に取り、`Unsubscribe`を返す関数になっています。
`nextOrObserver`以外にも`error`や`completed`が受け取れますが、今回は使いません。

### nextOrObserverとは
`nextOrObserver`は`userのsign-in`が変わるたびにトリガーされる高階関数です。   
`(user: User) => {}`の形で関数を渡すことができるのでこの`user`を 

```ts:auth-public.d.ts
export declare function onAuthStateChanged(auth: Auth, nextOrObserver: NextOrObserver<User>, error?: ErrorFn, completed?: CompleteFn): Unsubscribe;
```

### onAuthStateChangedの使い方
一般的に`onAuthStateChanged`は認証状態を監視したいので`useEffect`の中で使うことが多いです。   
`useEffect`の`return`で`onAuthStateChanged`返すことで、コンポーネントがマウントされた時に`onAuthStateChanged`が実行され、コンポーネントがアンマウントされた時に`onAuthStateChanged`を解除することができます。

```ts:onAuthStateChanged
import { useEffect } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const App = () => {
  useEffect(() => {
    return onAuthStateChanged(getAuth(), (user) => {
      setUser(user)
    })
  }, [])

  return null
}
```

## 認証状態をグローバルに管理するProviderの作成しよう
`onAuthStateChanged`を使って認証状態を監視することができました。   
認証状態はアプリケーション全体で取得したいので、グローバルで管理することにします。   
`React`でstateをグローバルで管理する方法は無いですが、[Context API](https://reactjs.org/docs/context.html#when-to-use-context)を使って`_app.tsx`配下を囲うことでアプリケーション全体で呼び出す事ができます。

```shell:ターミナル
$ mkdir -p src/feature/auth/provider
$ touch src/feature/auth/provider/AuthProvider.tsx
```

```diff shell:ディレクトリ
src
├── constant
│   └── env.ts
+├── feature
+│   └── auth
+│       └── provider
+│           └── AuthProvider.tsx
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


#### グローバルで定義する型を定義しよう
userの型を`User | null | undefined`にしました。   
- `undefined`は初期値の状態を表します
- `null`は認証されていない状態を表します
- `User`は認証されている状態を表します

```ts
type GlobalAuthState = {
  user: User | null | undefined
}
```

```tsx:src/feature/auth/provider/AuthProvider.tsx
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import type { User } from '@firebase/auth'
import { getAuth, onAuthStateChanged } from '@firebase/auth'

export type GlobalAuthState = {
  user: User | null | undefined
}
const initialState: GlobalAuthState = {
  user: undefined,
}
const AuthContext = createContext<GlobalAuthState>(initialState)

type Props = { children: ReactNode }

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<GlobalAuthState>(initialState)

  useEffect(() => {
    try {
      const auth = getAuth()
      return onAuthStateChanged(auth, (user) => {
        setUser({
          user,
        })
      })
    } catch (error) {
      setUser(initialState)
      throw error
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => useContext(AuthContext)
```

```diff tsx:src/pages/_app.tsx
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import { initializeFirebaseApp } from '@src/lib/firebase/firebase'
+import { AuthProvider } from '@src/feature/auth/provider/AuthProvider'

initializeFirebaseApp()
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
+      <AuthProvider>
        <Component {...pageProps} />
+      </AuthProvider>
    </ChakraProvider>
  )
}

export default MyApp
```


`AuthProvider`で囲われた要素では`useAuthContext`を使って認証状態を取得することができます。

```tsx
const Page = () => {
  const { user } = useAuthContext()
  
  return null
}
```

## Headerを作ろう
認証状態を取得はできましたが、UI上で確認する方法がありません。   
そこで、簡易的なHeaderを作成し、認証状態を表示しましょう。

```shell:ターミナル
$ mkdir -p src/component/Header
$ touch src/component/Header/Header.tsx
```

```diff shell:ディレクトリ
src
+├── component
+│   └── Header
+│       └── Header.tsx
├── constant
│   └── env.ts
├── feature
│   └── auth
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

## HeaderのUIを作成しよう

```tsx:src/component/Header/Header.tsx
import { chakra, Container, Heading } from '@chakra-ui/react'

export const Header = () => {
  return (
    <chakra.header py={4} bgColor={'blue.600'}>
      <Container maxW={'container.lg'}>
        <Heading color={'white'}>ログアウト中</Heading>
      </Container>
    </chakra.header>
  )
}
```

### Headerをアプリケーションに読み込ませよう

```diff tsx:src/pages/_app.tsx
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import { initializeFirebaseApp } from '@src/lib/firebase/firebase'
import { AuthProvider } from '@src/feature/auth/provider/AuthProvider'
+import { Header } from '@src/component/Header/Header'

initializeFirebaseApp()
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <AuthProvider>
+        <Header />
        <Component {...pageProps} />
      </AuthProvider>
    </ChakraProvider>
  )
}

export default MyApp
```

![](/images/firebase-chat-book/chapter7-01.png)


### 認証状態を取得し、認証状態に応じてHeaderのUIを変更しよう

```diff tsx:src/component/Header/Header.tsx
import { chakra, Container, Heading } from '@chakra-ui/react'
+import { useAuthContext } from '@src/feature/auth/provider/AuthProvider'

export const Header = () => {
+  const { user } = useAuthContext()

  return (
    <chakra.header py={4} bgColor={'blue.600'}>
      <Container maxW={'container.lg'}>
-        <Heading color={'white'}>ログアウト中</Heading>
+        <Heading color={'white'}>
+          {user ? 'ログイン中' : 'ログアウト中'}
+        </Heading>
      </Container>
    </chakra.header>
  )
}
```

![](/images/firebase-chat-book/chapter7-02.gif)

https://github.com/hisho/zenn-firebase-chat-demo/tree/chapter7