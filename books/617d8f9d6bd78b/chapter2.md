---
title: "Chakra UIのセットアップ"
---

# Chakra UIのセットアップ

https://chakra-ui.com/getting-started

```shell
$ yarn add @chakra-ui/react @emotion/react @emotion/styled framer-motion
```

### src/pages/_app.tsxにChakra UIを適用する

```diff tsx:src/pages/_app.tsx
import type { AppProps } from 'next/app'
+import { ChakraProvider } from '@chakra-ui/react'

function MyApp({ Component, pageProps }: AppProps) {
  return (
+    <ChakraProvider>
      <Component {...pageProps} />
+    </ChakraProvider>
  )
}

export default MyApp
```

## Chakra UIが動いているか確認する

```diff tsx:src/pages/index.tsx
import type { NextPage } from 'next'
+import { Box, Heading } from '@chakra-ui/react'

const Page: NextPage = () => {
-  return <div>home</div>
+  return (
+    <Box>
+      <Heading>Chakra UI</Heading>
+   </Box>
+  )
}

export default Page
```

## この地点の画面
![](/images/firebase-chat-book/chapter2-01.png)

## ここまでのブランチ
https://github.com/hisho/zenn-firebase-chat-demo/tree/chapter2