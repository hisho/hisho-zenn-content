---
title: "pathを型安全にする"
---
`string`のままでは危ないので型安全にする


## pathpidaを導入する
pathをハードコードで書いてきたので、pathpidaを導入します。

```shell
$ yarn add pathpida
```

```diff ignore:.gitignore
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

+# pathpida
+src/lib/pathpida/$path.ts
```

```diff json:package.json
{
  "scripts": {
-    "dev": "next dev",
-    "build": "next build",
+    "dev": "run-p dev:* watch:*",
+    "dev:next": "next dev",
+    "build": "run-s generate:path build:next",
+    "build:next": "next build",
    "start": "next start",
    "lint": "run-p lint:*",
    "lint:next": "next lint . --ignore-path .prettierignore --max-warnings 0",
    "lint:prettier": "prettier --check .",
    "lint:typecheck": "tsc --pretty --noEmit",
    "format": "run-s format:eslint format:prettier",
    "format:eslint": "yarn lint:next --fix",
-    "format:prettier": "yarn lint:prettier --write"
+    "format:prettier": "yarn lint:prettier --write",
+    "watch:path": "pathpida --ignorePath .gitignore --output src/lib/pathpida --watch",
+    "generate:path": "pathpida --ignorePath .gitignore --output src/lib/pathpida"
  }
}
```

## pathpidaを使ったuseRouterとLinkのwrapperを作成する
pathpidaを使って、useRouterとLinkのwrapperを作成します。

```shell
$ mkdir -p src/hooks/useRouter
$ touch src/hooks/useRouter/useRouter.ts
````

```diff shell
src
├── component
│   └── Header
│       └── Header.tsx
├── constant
│   └── env.ts
├── feature
│   └── auth
│       ├── component
│       │   └── AuthGuard
│       │       └── AuthGuard.tsx
│       └── provider
│           └── AuthProvider.tsx
+├── hooks
+│   └── useRouter
+│       └── useRouter.ts
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

```ts:src/hooks/useRouter/useRouter.ts
import { useRouter as useNextRouter } from 'next/router'
import { useCallback } from 'react'
import type { UrlObject } from 'url'
import { pagesPath, PagesPath } from '@src/lib/pathpida/$path'

export const useRouter = () => {
  const nextRouter = useNextRouter()

  const push = useCallback(
    (url: UrlObject | ((path: PagesPath) => UrlObject)) => {
      return nextRouter.push(typeof url === 'function' ? url(pagesPath) : url)
    },
    [nextRouter]
  )

  const replace = useCallback(
    (url: UrlObject | ((path: PagesPath) => UrlObject)) => {
      return nextRouter.replace(
        typeof url === 'function' ? url(pagesPath) : url
      )
    },
    [nextRouter]
  )

  return { push, replace } as const
}
```

```shell
$ mkdir -p src/component/Navigate
$ touch src/component/Navigate/Navigate.tsx
```

```diff shell
src
├── component
│   ├── Header
│   │   └── Header.tsx
+│   └── Navigate
+│       └── Navigate.tsx
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

```tsx
import type { ReactNode } from 'react'
import Link from 'next/link'
import type { UrlObject } from 'url'
import { pagesPath, PagesPath } from '@src/lib/pathpida/$path'

type Props = {
  href: UrlObject | ((path: PagesPath) => UrlObject)
  children: ReactNode
}

export const Navigate = ({ href, children }: Props) => {
  return (
    <Link href={typeof href === 'function' ? href(pagesPath) : href} passHref>
      {children}
    </Link>
  )
}
```


## 既存のpahtをpathpidaに置き換える

```diff tsx:src/feature/auth/AuthGuard/AuthGuard.tsx
import { useAuthContext } from '@src/feature/auth/provider/AuthProvider'
-import { useRouter } from 'next/router'
import type { ReactNode } from 'react'
import { Box } from '@chakra-ui/react'
+import { useRouter } from '@src/hooks/useRouter/useRouter'

type Props = {
  children: ReactNode
}

export const AuthGuard = ({ children }: Props) => {
  const { user } = useAuthContext()
  const { push } = useRouter()

  if (typeof user === 'undefined') {
    return <Box>読み込み中...</Box>
  }

  if (user === null) {
-    push('/signin')
+    push((path) => path.signin.$url())
    return null
  }

  return <>{children}</>
}
```

```diff tsx:src/component/Header/Header.tsx
import {
  Avatar,
  Button,
  chakra,
  Container,
  Flex,
  Heading,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  useToast,
} from '@chakra-ui/react'
import { useAuthContext } from '@src/feature/auth/provider/AuthProvider'
import { FirebaseError } from '@firebase/util'
import { getAuth, signOut } from 'firebase/auth'
-import { useRouter } from 'next/router'
-import Link from 'next/link'
+import { Navigate } from '@src/component/Navigate/Navigate'
+import { useRouter } from '@src/hooks/useRouter/useRouter'

export const Header = () => {
  const { user } = useAuthContext()
  const toast = useToast()
  const { push } = useRouter()

  const handleSignOut = async () => {
    try {
      const auth = getAuth()
      await signOut(auth)
      toast({
        title: 'ログアウトしました。',
        status: 'success',
        position: 'top',
      })
-      push('/signin')
+      push((path) => path.signin.$url())
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.log(e)
      }
    }
  }

  return (
    <chakra.header py={4} bgColor={'blue.600'}>
      <Container maxW={'container.lg'}>
        <Flex>
-          <Link href={'/'} passHref>
+          <Navigate href={(path) => path.$url()}>
            <chakra.a
              _hover={{
                opacity: 0.8,
              }}
            >
              <Heading color={'white'}>Firebase Realtime Chat</Heading>
            </chakra.a>
-          </Link>
+          </Navigate>
          <Spacer aria-hidden />
          {user ? (
            <Menu>
              <MenuButton>
                <Avatar flexShrink={0} width={10} height={10} />
              </MenuButton>
              <MenuList py={0}>
                <MenuItem onClick={handleSignOut}>サインアウト</MenuItem>
              </MenuList>
            </Menu>
          ) : (
-            <Link href={'/signin'} passHref>
+            <Navigate href={(path) => path.signin.$url()}>
              <Button as={'a'} colorScheme={'teal'}>
                サインイン
              </Button>
-            </Link>
+            </Navigate>
          )}
        </Flex>
      </Container>
    </chakra.header>
  )
}
```

https://github.com/hisho/zenn-firebase-chat-demo/tree/chapter13