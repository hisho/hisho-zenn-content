# Footerの作成

リンクを表示させたいので、Footer.tsxを作成します。


```shell
$ mkdir -p src/component/Footer
$ touch src/component/Footer/Footer.tsx
```

```diff shell
src
├── component
+│   ├── Footer
+│   │   └── Footer.tsx
│   ├── Header
│   │   └── Header.tsx
│   └── Navigate
│       └── Navigate.tsx
├── constant
│   └── env.ts
├── feature
│   └── auth
│       ├── component
│       │   └── AuthGuard
│       │       └── AuthGuard.tsx
│       └── provider
│           └── AuthProvider.tsx
├── hooks
│   └── useRouter
│       └── useRouter.ts
├── lib
│   ├── firebase
│   │   └── firebase.ts
│   └── pathpida
│       └── $path.ts
└── pages
    ├── _app.tsx
    ├── chat
    │   └── index.tsx
    ├── index.tsx
    ├── signin
    │   └── index.tsx
    └── signup
        └── index.tsx
```

```tsx:src/component/Footer/Footer.tsx
import { chakra, Container } from '@chakra-ui/react'

export const Footer = () => {
  return (
    <chakra.footer py={4} bgColor={'blue.600'} color={'white'}>
      <Container maxW={'container.lg'}>Footer</Container>
    </chakra.footer>
  )
}
```

```diff tsx:src/pages/_app.tsx
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import { initializeFirebaseApp } from '@src/lib/firebase/firebase'
import { AuthProvider } from '@src/feature/auth/provider/AuthProvider'
import { Header } from '@src/component/Header/Header'
+import { Footer } from '@src/component/Footer/Footer'

initializeFirebaseApp()
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Header />
        <Component {...pageProps} />
+        <Footer />
      </AuthProvider>
    </ChakraProvider>
  )
}

export default MyApp
```

![](/images/firebase-chat-book/chapter14-01.png)

## UIを整える

```diff tsx
-import { chakra, Container } from '@chakra-ui/react'
+import { chakra, Container, Flex, Link } from '@chakra-ui/react'
import { Navigate } from '@src/component/Navigate/Navigate'

export const Footer = () => {
  return (
    <chakra.footer py={4} bgColor={'blue.600'} color={'white'}>
-      <Container maxW={'container.lg'}>Footer</Container>
+      <Container maxW={'container.lg'}>
+        <Flex flexDirection={'column'} gap={2} alignItems={'start'}>
+          <Navigate href={(path) => path.$url()}>
+            <Link lineHeight={1}>トップページ</Link>
+          </Navigate>
+          <Navigate href={(path) => path.signin.$url()}>
+            <Link lineHeight={1}>サインイン</Link>
+          </Navigate>
+          <Navigate href={(path) => path.signup.$url()}>
+            <Link lineHeight={1}>サインアップ</Link>
+          </Navigate>
+          <Navigate href={(path) => path.chat.$url()}>
+            <Link lineHeight={1}>チャット</Link>
+          </Navigate>
+        </Flex>
+      </Container>
    </chakra.footer>
  )
}
```

![](/images/firebase-chat-book/chapter14-02.gif)


https://github.com/hisho/zenn-firebase-chat-demo/tree/chapter14