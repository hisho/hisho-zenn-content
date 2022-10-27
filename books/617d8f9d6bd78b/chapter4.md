---
title: "[実装編]Next.jsにFirebaseをセットアップしよう"
---
# Next.jsにFirebaseをセットアップしよう

## Firebaseをインストールしよう
```shell
$ yarn add firebase
```

## Firebaseの設定しよう
Firebaseの設定は、Firebaseのコンソールから取得できます。

### src/lib/firebase/firebase.tsを作成しよう
```shell
$ mkdir -p src/lib/firebase
$ touch src/lib/firebase/firebase.ts
```

```diff text
src
+├── lib
+│   └── firebase
+│       └── firebase.ts
└── pages
    ├── _app.tsx
    └── index.tsx
```

### Firebaseのコンソールから設定をコピーしよう
![](/images/firebase-chat-book/chapter4-01.png)
![](/images/firebase-chat-book/chapter4-02.png)

### src/lib/firebase/firebase.tsにコピーしたものを貼り付けよう

```diff ts:src/lib/firebase/firebase.ts
-// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
-// TODO: Add SDKs for Firebase products that you want to use
-// https://firebase.google.com/docs/web/setup#available-libraries

-// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

-// Initialize Firebase
const app = initializeApp(firebaseConfig);
```

## firebaseConfigの中身を.env.localに移動しよう
```shell
$ touch .env.local
```

```diff text
.
+├── .env.local
├── .eslintrc.json
├── .gitignore
├── .prettierignore
├── .prettierrc
├── README.md
├── next-env.d.ts
├── next.config.js
├── package.json
├── src
├── tsconfig.json
└── yarn.lock
```

```text:.env.local
NEXT_PUBLIC_FIREBASE_API_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_PROJECT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_APP_ID=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### env.tsを作成しよう
```shell
$ mkdir -p src/constant
$ touch src/constant/env.ts
```

```diff text
src
+├── constant
+│   └── env.ts
├── lib
│   └── firebase
│       └── firebase.ts
└── pages
    ├── _app.tsx
    └── index.tsx
```

```ts:src/constant/env.ts
export const FIREBASE_API_KEY =
  process.env['NEXT_PUBLIC_FIREBASE_API_KEY'] ?? ''
export const FIREBASE_AUTH_DOMAIN =
  process.env['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'] ?? ''
export const FIREBASE_PROJECT_ID =
  process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] ?? ''
export const FIREBASE_STORAGE_BUCKET =
  process.env['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'] ?? ''
export const FIREBASE_MESSAGING_SENDER_ID =
  process.env['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'] ?? ''
export const FIREBASE_APP_ID = process.env['NEXT_PUBLIC_FIREBASE_APP_ID'] ?? ''

```


### src/lib/firebase/firebase.tsのfirebaseConfigを.env.localの値に置き換えよう

```diff ts:src/lib/firebase/firebase.ts
import { initializeApp } from 'firebase/app'
+import {
+  FIREBASE_API_KEY,
+  FIREBASE_APP_ID,
+  FIREBASE_AUTH_DOMAIN,
+  FIREBASE_MESSAGING_SENDER_ID,
+  FIREBASE_PROJECT_ID,
+  FIREBASE_STORAGE_BUCKET,
+} from '@src/constant/env'

const firebaseConfig = {
-  apiKey: "",
-  authDomain: "",
-  projectId: "",
-  storageBucket: "",
-  messagingSenderId: "",
-  appId: ""
+  apiKey: FIREBASE_API_KEY,
+  authDomain: FIREBASE_AUTH_DOMAIN,
+  projectId: FIREBASE_PROJECT_ID,
+  storageBucket: FIREBASE_STORAGE_BUCKET,
+  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
+  appId: FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
```

## Next.jsでFirebaseを初期化しよう

### initializeAppを_app.tsxで呼び、firebaseをアプリで初期化しよう
```diff ts:src/lib/firebase/firebase.ts
-import { initializeApp } from 'firebase/app'
+import { getApp, getApps, initializeApp } from 'firebase/app'
import {
  FIREBASE_API_KEY,
  FIREBASE_APP_ID,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
} from '@src/constant/env'

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)
+export const initializeFirebaseApp = () =>
+  !getApps().length ? initializeApp(firebaseConfig) : getApp()
```


```diff tsx:src/pages/_app.tsx
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
+import { initializeFirebaseApp } from '@src/lib/firebase/firebase'

+initializeFirebaseApp()
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default MyApp
```

## Firebaseの初期化が正しく動いているか確認しよう

```diff tsx:tsx:src/pages/_app.tsx
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import { initializeFirebaseApp } from '@src/lib/firebase/firebase'
+import { getApp } from 'firebase/app'

initializeFirebaseApp()
function MyApp({ Component, pageProps }: AppProps) {
+  console.log(getApp())
  return (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default MyApp

```

ブラウザのconsoleに出ていたらOK
![](/images/firebase-chat-book/chapter4-03.png)

## ここまでのディレクトリ

```text
.
├── .env.local
├── .eslintrc.json
├── .gitignore
├── .prettierignore
├── .prettierrc
├── README.md
├── next-env.d.ts
├── next.config.js
├── package.json
├── src
│   ├── constant
│   │   └── env.ts
│   ├── lib
│   │   └── firebase
│   │       └── firebase.ts
│   └── pages
│       ├── _app.tsx
│       └── index.tsx
├── tsconfig.json
├── tsconfig.tsbuildinfo
├── yarn-error.log
└── yarn.lock
```

## Next.jsにFirebaseのセットアップが完了した地点のブランチ
https://github.com/hisho/zenn-firebase-chat-demo/tree/chapter4
