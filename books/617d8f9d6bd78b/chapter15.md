---
title: "細かい機能を実装する"
---

## ログイン後にチャットページにリダイレクトする

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
  useToast,
} from '@chakra-ui/react'
import { FormEvent, useState } from 'react'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { FirebaseError } from '@firebase/util'
import { useRouter } from '@src/hooks/useRouter/useRouter'

export const Page = () => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const toast = useToast()
+  const { push } = useRouter()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setIsLoading(true)
    e.preventDefault()
    try {
      const auth = getAuth()
      await signInWithEmailAndPassword(auth, email, password)
      setEmail('')
      setPassword('')
      toast({
        title: 'ログインしました。',
        status: 'success',
        position: 'top',
      })
-      //TODO: ログイン後のページに遷移の処理を書く
+      push((path) => path.chat.$url())
    } catch (e) {
      toast({
        title: 'エラーが発生しました。',
        status: 'error',
        position: 'top',
      })
      if (e instanceof FirebaseError) {
        console.log(e)
      }
    } finally {
      setIsLoading(false)
    }
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
          <Button type={'submit'} isLoading={isLoading}>
            ログイン
          </Button>
        </Center>
      </chakra.form>
    </Container>
  )
}

export default Page
```

![](/images/firebase-chat-book/chapter15-01.gif)

```diff tsx:pages/signup/index.tsx
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
  useToast,
} from '@chakra-ui/react'
import { FormEvent, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
} from 'firebase/auth'
import { FirebaseError } from '@firebase/util'
+import { useRouter } from '@src/hooks/useRouter/useRouter'

export const Page = () => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const toast = useToast()
+  const { push } = useRouter()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setIsLoading(true)
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
      toast({
        title: '確認メールを送信しました。',
        status: 'success',
        position: 'top',
      })
+      push((path) => path.chat.$url())
    } catch (e) {
      toast({
        title: 'エラーが発生しました。',
        status: 'error',
        position: 'top',
      })
      if (e instanceof FirebaseError) {
        console.log(e)
      }
    } finally {
      setIsLoading(false)
    }
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
          <Button type={'submit'} isLoading={isLoading}>
            アカウントを作成
          </Button>
        </Center>
      </chakra.form>
    </Container>
  )
}

export default Page
```

![](/images/firebase-chat-book/chapter15-02.gif)

## AuthGuardをチャットページに適用する
認証がかかってないのでかけましょう

```diff tsx:pages/chat/index.tsx
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
import { FormEvent, useEffect, useState } from 'react'
import { getDatabase, onChildAdded, push, ref } from '@firebase/database'
import { FirebaseError } from '@firebase/util'
+import { AuthGuard } from '@src/feature/auth/component/AuthGuard/AuthGuard'

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

  const [chats, setChats] = useState<{ message: string }[]>([])

  useEffect(() => {
    try {
      const db = getDatabase()
      const dbRef = ref(db, 'chat')
      return onChildAdded(dbRef, (snapshot) => {
        const message = String(snapshot.val()['message'] ?? '')
        setChats((prev) => [...prev, { message }])
      })
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.error(e)
      }
      return
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
+    <AuthGuard>
      <Container py={14}>
        <Heading>チャット</Heading>
        <Spacer height={4} aria-hidden />
        <Flex flexDirection={'column'} overflowY={'auto'} gap={2} height={400}>
          {chats.map((chat, index) => (
            <Message message={chat.message} key={`ChatMessage_${index}`} />
          ))}
        </Flex>
        <Spacer height={2} aria-hidden />
        <chakra.form display={'flex'} gap={2} onSubmit={handleSendMessage}>
          <Input value={message} onChange={(e) => setMessage(e.target.value)} />
          <Button type={'submit'}>送信</Button>
        </chakra.form>
      </Container>
+    </AuthGuard>
  )
}

export default Page
```


## このままだと最新のメッセージがうまるので修正する

![](/images/firebase-chat-book/chapter15-03.gif)


```diff tsx:pages/chat/index.tsx
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
-import { FormEvent, useEffect, useState } from 'react'
+import { FormEvent, useEffect, useRef, useState } from 'react'
import { getDatabase, onChildAdded, push, ref } from '@firebase/database'
import { FirebaseError } from '@firebase/util'
import { AuthGuard } from '@src/feature/auth/component/AuthGuard/AuthGuard'

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
-  const messagesElementRef = useRef<HTMLDivElement | null>(null)
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

  const [chats, setChats] = useState<{ message: string }[]>([])

  useEffect(() => {
    try {
      const db = getDatabase()
      const dbRef = ref(db, 'chat')
      return onChildAdded(dbRef, (snapshot) => {
        const message = String(snapshot.val()['message'] ?? '')
        setChats((prev) => [...prev, { message }])
      })
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.error(e)
      }
      return
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

+  useEffect(() => {
+    messagesElementRef.current?.scrollTo({
+      top: messagesElementRef.current.scrollHeight,
+    })
+  }, [chats])

  return (
    <AuthGuard>
      <Container py={14}>
        <Heading>チャット</Heading>
        <Spacer height={4} aria-hidden />
-        <Flex flexDirection={'column'} overflowY={'auto'} gap={2} height={400}>
+        <Flex
+          flexDirection={'column'}
+          overflowY={'auto'}
+          gap={2}
+          height={400}
+          ref={messagesElementRef}
+        >
          {chats.map((chat, index) => (
            <Message message={chat.message} key={`ChatMessage_${index}`} />
          ))}
        </Flex>
        <Spacer height={2} aria-hidden />
        <chakra.form display={'flex'} gap={2} onSubmit={handleSendMessage}>
          <Input value={message} onChange={(e) => setMessage(e.target.value)} />
          <Button type={'submit'}>送信</Button>
        </chakra.form>
      </Container>
    </AuthGuard>
  )
}

export default Page
```

![](/images/firebase-chat-book/chapter15-04.gif)

## コンテンツが無い時も画面いっぱいまでコンテンツを広げる

![](/images/firebase-chat-book/chapter15-05.png)

https://chakra-ui.com/docs/styled-system/customize-theme

```shell
$ mkdir -p src/lib/chakra
$ touch src/lib/chakra/theme.ts
```

```diff shell
src
├── component
│   ├── Footer
│   │   └── Footer.tsx
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
+│   ├── chakra
+│   │   └── theme.ts
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

```ts
import { extendTheme } from '@chakra-ui/react'

export const theme = extendTheme({
  styles: {
    global: {
      'html, body,#__next': {
        height: '100%',
        '&': {
          height: '100svh',
        },
      },
      '#__next': {
        display: 'flex',
        flexDirection: 'column',
      },
    },
  },
})
```

```diff tsx:pages/_app.tsx 
import type { AppProps } from 'next/app'
-import { ChakraProvider } from '@chakra-ui/react'
+import { chakra, ChakraProvider } from '@chakra-ui/react'
import { initializeFirebaseApp } from '@src/lib/firebase/firebase'
import { AuthProvider } from '@src/feature/auth/provider/AuthProvider'
import { Header } from '@src/component/Header/Header'
import { Footer } from '@src/component/Footer/Footer'
+import { theme } from '@src/lib/chakra/theme'

initializeFirebaseApp()
function MyApp({ Component, pageProps }: AppProps) {
  return (
-    <ChakraProvider>
+    <ChakraProvider theme={theme}>
      <AuthProvider>
        <Header />
+        <chakra.main flex={1} display={'flex'} flexDirection={'column'}>
          <Component {...pageProps} />
+        </chakra.main>
        <Footer />
      </AuthProvider>
    </ChakraProvider>
  )
}

export default MyApp
```

![](/images/firebase-chat-book/chapter15-06.png)

## chatページがくずれたので修正

![](/images/firebase-chat-book/chapter15-07.png)

```diff tsx:pages/_app.tsx
import type { AppProps } from 'next/app'
import { chakra, ChakraProvider } from '@chakra-ui/react'
import { initializeFirebaseApp } from '@src/lib/firebase/firebase'
import { AuthProvider } from '@src/feature/auth/provider/AuthProvider'
import { Header } from '@src/component/Header/Header'
import { Footer } from '@src/component/Footer/Footer'
import { theme } from '@src/lib/chakra/theme'

initializeFirebaseApp()
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <Header />
-        <chakra.main flex={1} display={'flex'} flexDirection={'column'}>
+        <chakra.main
+          flex={1}
+          display={'flex'}
+          flexDirection={'column'}
+          minHeight={0}
+        >
          <Component {...pageProps} />
        </chakra.main>
        <Footer />
      </AuthProvider>
    </ChakraProvider>
  )
}

export default MyApp
```

```diff tsx:pages/chat/index.tsx
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
import { FormEvent, useEffect, useRef, useState } from 'react'
import { getDatabase, onChildAdded, push, ref } from '@firebase/database'
import { FirebaseError } from '@firebase/util'
import { AuthGuard } from '@src/feature/auth/component/AuthGuard/AuthGuard'

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
  const messagesElementRef = useRef<HTMLDivElement | null>(null)
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

  const [chats, setChats] = useState<{ message: string }[]>([])

  useEffect(() => {
    try {
      const db = getDatabase()
      const dbRef = ref(db, 'chat')
      return onChildAdded(dbRef, (snapshot) => {
        const message = String(snapshot.val()['message'] ?? '')
        setChats((prev) => [...prev, { message }])
      })
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.error(e)
      }
      return
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    messagesElementRef.current?.scrollTo({
      top: messagesElementRef.current.scrollHeight,
    })
  }, [chats])

  return (
    <AuthGuard>
-      <Container py={14}>
+      <Container
+        py={14}
+        flex={1}
+        display={'flex'}
+        flexDirection={'column'}
+        minHeight={0}
+      >
        <Heading>チャット</Heading>
-        <Spacer height={4} aria-hidden />
+        <Spacer flex={'none'} height={4} aria-hidden />
        <Flex
          flexDirection={'column'}
          overflowY={'auto'}
          gap={2}
-          height={400}
          ref={messagesElementRef}
        >
          {chats.map((chat, index) => (
            <Message message={chat.message} key={`ChatMessage_${index}`} />
          ))}
        </Flex>
-        <Spacer height={2} aria-hidden />
+        <Spacer aria-hidden />
+        <Spacer height={2} aria-hidden flex={'none'} />
        <chakra.form display={'flex'} gap={2} onSubmit={handleSendMessage}>
          <Input value={message} onChange={(e) => setMessage(e.target.value)} />
          <Button type={'submit'}>送信</Button>
        </chakra.form>
      </Container>
    </AuthGuard>
  )
}

export default Page
```

![](/images/firebase-chat-book/chapter15-08.png)

https://github.com/hisho/zenn-firebase-chat-demo/tree/chapter15