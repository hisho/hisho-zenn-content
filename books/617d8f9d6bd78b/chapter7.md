---
title: "認証状態を取得する"
---

# 認証状態を取得する

https://firebase.google.com/docs/auth/web/manage-users?hl=ja#get_the_currently_signed-in_user

## Firebase Authenticationを使って認証状態を取得する
```ts
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

## グローバルで認証管理する

```shell
$ mkdir -p src/feature/auth/provider
$ touch src/feature/auth/provider/AuthProvider.tsx
```

```diff shell
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

## 認証状態をグローバルに管理するProviderの作成
型は`User | null | undefined`で、`undefined`は初期値の状態を表す。

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

## Headerを作る

```shell
$ mkdir -p src/component/Header
$ touch src/component/Header/Header.tsx
```

```diff shell
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

## HaeaderのUIを作成

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

### Headerを読み込ませる

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


### 認証状態を取得する

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

https://github.com/hisho/zenn-firebase-chat-demo/tree/chapter6