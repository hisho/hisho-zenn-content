---
title: "Next.jsのセットアップ"
---

# Next.jsのセットアップ

Next.jsの[Getting Started](https://nextjs.org/docs/getting-started#automatic-setup)に沿って、Next.jsのプロジェクトを作成します。   
今回は、TypeScriptを使うので、`--typescript`フラグを指定します。   
適当な場所でターミナルを開きコマンドを実行します

```shell
$ yarn create next-app --typescript
```
   
コマンドを実行すると`名前`を聞かれるので適当な名前を入力します。   
今回はchat-appとします。

```shell
$ ? What is your project named? › chat-app
```

`Success! Created my-app at chat-app`と出たらインストール完了です。   
先程作った`chat-app`フォルダに移動します

```shell
$ cd chat-app
```

```shell
$ yarn dev
```

[http://localhost:3000](http://localhost:3000)にアクセスすると、Next.jsのデフォルトのページが表示されます。

![](/images/firebase-chat-book/chapter1-01.png)

## 不要なファイルを削除して、ディレクトリ構成を整理する
コマンドから削除していますが、最終的に下記のディレクトリ構成と同じになれば普通にGUIから削除しても問題ありません。

### srcディレクトリを作成する
```shell
$ mkdir src
```

### 不要なファイル、フォルダを削除する
`public`、`styles`と`pages/api`は不要なので削除します
```shell
$ rm -rf public && rm -rf styles && rm -rf pages/api
```

### srcディレクトリに集約する
`pages`ディレクトリの中身を`src`ディレクトリに移動します
```shell
$ mv pages src/pages
```

## _app.tsxを整理する
`src/pages/_app.tsx`の`globals.css`を削除します。

```diff tsx:src/pages/_app.tsx
- import '../styles/globals.css'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
```

## index.tsxを整理する
pages/index.tsxは中身をすべて消して下記のようにします。   
`export default`するので変数名はなんでもいいので`Page`に統一するために`Home`を`Page`に変更します。

```diff tsx:src/pages/index.tsx
import type { NextPage } from 'next'

- const Home: NextPage = () => {
+ const Page: NextPage = () => {
  return (
   <div>home</div>
  )
}

export default Page
```

## ここまでのディレクトリ

ここまでのディレクトリは下記のようになります。
```shell
.
├── .eslintrc.json
├── .gitignore
├── README.md
├── next-env.d.ts
├── next.config.js
├── package.json
├── src
│   └── pages
│       ├── _app.tsx
│       └── index.tsx
├── tsconfig.json
└── yarn.lock
```

## ここまでの画面
なにもなくなって寂しい🥲
![](/images/firebase-chat-book/chapter1-02.png)

## TypeScriptの設定を変更する
とりあえず、厳しいやつにしとけばいい

```shell
$ yarn add -D @tsconfig/strictest
```

```diff json
{
+  "extends": "@tsconfig/strictest/tsconfig.json",
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}

```


### prettierの設定を変更する
```shell
$ yarn add -D prettier
```

```json:.prettierrc
{
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": false,
  "singleQuote": true
}
```

```json:.prettierignore
.next
package.json
yarn.lock
node_modules
```

## npm scriptsを変更する
```shell
$ yarn add -D npm-run-all
```

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "run-p lint:*",
    "lint:next": "next lint . --ignore-path .prettierignore --max-warnings 0",
    "lint:prettier": "prettier --check .",
    "lint:typecheck": "tsc --pretty --noEmit",
    "format": "run-s format:eslint format:prettier",
    "format:eslint": "yarn lint:next --fix",
    "format:prettier": "yarn lint:prettier --write"
  }
}

```

## formatする
```shell
$ yarn format
```

## ここまでのディレクトリ

```shell
.
├── .eslintrc.json
├── .gitignore
├── .prettierignore
├── .prettierrc
├── README.md
├── next-env.d.ts
├── next.config.js
├── package.json
├── src
│   └── pages
│       ├── _app.tsx
│       └── index.tsx
├── tsconfig.json
├── tsconfig.tsbuildinfo
├── yarn-error.log
└── yarn.lock
```

## ここまでのブランチ
https://github.com/hisho/zenn-firebase-chat-demo/tree/chapter1