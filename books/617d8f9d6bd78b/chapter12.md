---
title: "[UI実装編]Headerを整える"
---


# HeaderのUIを整える

## pages/index.tsxのAuthGuardを外す
トップページで認証をかけたくないので外す

```diff tsx:src/pages/index.tsx
import type { NextPage } from 'next'
import { Heading } from '@chakra-ui/react'
-import { AuthGuard } from '@src/feature/auth/component/AuthGuard/AuthGuard'

const Page: NextPage = () => {
-  return (
-    <AuthGuard>
-      <Heading>Chakra UI</Heading>
-    </AuthGuard>
-  )
+  return <Heading>Chakra UI</Heading>
}

export default Page
```

## Headerを整える

- UIを整えた
- isLoadingを削除
- トップページへのリンク追加
- ログインの状態によってUIを出し分け

```diff tsx:src/componet/Header/Header.tsx
-import { Button, chakra, Container, Heading, useToast } from '@chakra-ui/react'
+import {
+  Avatar,
+  Button,
+  chakra,
+  Container,
+  Flex,
+  Heading,
+  Menu,
+  MenuButton,
+  MenuItem,
+  MenuList,
+  Spacer,
+  useToast,
+} from '@chakra-ui/react'
import { useAuthContext } from '@src/feature/auth/provider/AuthProvider'
import { FirebaseError } from '@firebase/util'
import { getAuth, signOut } from 'firebase/auth'
-import { useState } from 'react'
import { useRouter } from 'next/router'
+import Link from 'next/link'

export const Header = () => {
  const { user } = useAuthContext()
-  const [isLoading, setIsLoading] = useState<boolean>(false)
  const toast = useToast()
  const { push } = useRouter()

  const handleSignOut = async () => {
-    setIsLoading(true)
    try {
      const auth = getAuth()
      await signOut(auth)
      toast({
        title: 'ログアウトしました。',
        status: 'success',
        position: 'top',
      })
      push('/signin')
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.log(e)
      }
-    } finally {
-      setIsLoading(false)
    }
  }

  return (
    <chakra.header py={4} bgColor={'blue.600'}>
      <Container maxW={'container.lg'}>
-        <Heading color={'white'}>
+        <Flex>
+          <Link href={'/'} passHref>
+            <chakra.a
+              _hover={{
+                opacity: 0.8,
+              }}
+            >
+              <Heading color={'white'}>Firebase Realtime Chat</Heading>
+            </chakra.a>
+          </Link>
+          <Spacer aria-hidden />
          {user ? (
-            <Button
-              colorScheme={'teal'}
-              onClick={handleSignOut}
-              isLoading={isLoading}
-            >
-              サインアウト
+            <Menu>
+              <MenuButton>
+                <Avatar flexShrink={0} width={10} height={10} />
+              </MenuButton>
+              <MenuList py={0}>
+                <MenuItem onClick={handleSignOut}>サインアウト</MenuItem>
+              </MenuList>
+            </Menu>
+          ) : (
+            <Link href={'/signin'} passHref>
+              <Button as={'a'} colorScheme={'teal'}>
+                サインイン
              </Button>
-          ) : (
-            'ログアウト中'
+            </Link>
          )}
-        </Heading>
+        </Flex>
      </Container>
    </chakra.header>
  )
}
```

![](/images/firebase-chat-book/chapter12-01.gif)

https://github.com/hisho/zenn-firebase-chat-demo/tree/chapter12