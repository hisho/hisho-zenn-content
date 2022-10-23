---
title: "Chakra UIのセットアップ"
---

# Chakra UIのセットアップ
UIの実装は`Chakra UI`を使っていきます。   
公式の`Installation`に則って、`Chakra UI`をインストールします。

https://chakra-ui.com/getting-started

```shell:ターミナル
$ yarn add @chakra-ui/react @emotion/react @emotion/styled framer-motion
```

### src/pages/_app.tsxにChakra UIを適用する
Chakra UIは`ChakraProvider`で囲った配下でしか使えないですが、今回はアプリケーション全体で使いたいので`_app.tsx`に`ChakraProvider`を追記します。


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

`Chakra UI`については下記の`book`が参考になります。
https://zenn.dev/terrierscript/books/2021-05-chakra-ui

基本的に`Box`か`chakra.[htmlタグ]`を使っておけば問題ないです。

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

## Chakra UIが動いているか確認画面ん
`Heading`で囲った部分の文字が大きくなっていることが確認できると思います。
![](/images/firebase-chat-book/chapter2-01.png)

## Chakra UIのセットアップが完了した地点のブランチ
https://github.com/hisho/zenn-firebase-chat-demo/tree/chapter2