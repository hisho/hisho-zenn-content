---
title: "[実装編]Next.jsをセットアップしよう"
---

# Next.jsをセットアップしよう

はじめにNext.jsの[Getting Started](https://nextjs.org/docs/getting-started#automatic-setup)に沿って、Next.jsのプロジェクトを作成します。   
今回は、TypeScriptを使うので、`--typescript`フラグを指定します。   
適当な場所でターミナルを開きコマンドを実行します

```shell:ターミナル
$ yarn create next-app --typescript
```
   
コマンドを実行すると`name`を聞かれるので適当な名前を入力します。   
今回はchat-appとします。

```shell:ターミナル
$ ? What is your project named? › chat-app
```

`Success! Created my-app at chat-app`と出たらインストール完了です。   
先程作った`chat-app`フォルダに移動します

```shell:ターミナル
$ cd chat-app
```

```shell:ターミナル
$ yarn dev
```

[http://localhost:3000](http://localhost:3000)にアクセスすると、Next.jsのデフォルトのページが表示されます。

![](/images/firebase-chat-book/chapter1-01.png)

## 不要なファイルを削除して、ディレクトリ構成を整理しよう
コマンドから削除していますが、最終的に下記のディレクトリ構成と同じになれば普通にGUIから削除しても問題ありません。

### srcディレクトリを作成しよう
```shell:ターミナル
$ mkdir src
```

### 不要なファイル、フォルダを削除しよう
`public`、`styles`と`pages/api`は不要なので削除します
```shell:ターミナル
$ rm -rf public && rm -rf styles && rm -rf pages/api
```

### srcディレクトリに集約しよう
`pages`ディレクトリの中身を`src`ディレクトリに移動します
```shell:ターミナル
$ mv pages src/pages
```

## ディレクトリ

ここまでのディレクトリは下記のようになります。
```diff text:ディレクトリ
.
├── .eslintrc.json
├── .gitignore
├── README.md
├── next-env.d.ts
├── next.config.js
├── package.json
-├── public
-├── styles
-│── pages
-│  ├── _app.tsx
-│  ├── index.tsx
-│  └── api
-│       └── hello.ts
+├── src
+│   └── pages
+│       ├── _app.tsx
+│       └── index.tsx
├── tsconfig.json
└── yarn.lock
```

## _app.tsxを整理しよう
`src/pages/_app.tsx`の`globals.css`が不要になったので削除します。

```diff tsx:src/pages/_app.tsx
- import '../styles/globals.css'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
```

## index.tsxを整理しよう
pages/index.tsxは中身をすべて消して下記のようにします。   
`const Home: NextPage = () => {}`の部分の変数名は`export default`するのでなんでもいいので`Page`に統一するために`Home`を`Page`に変更します。

```diff tsx:src/pages/index.tsx
import type { NextPage } from 'next'

- const Home: NextPage = () => {
+ const Page: NextPage = () => {
  return (
   <div>home</div>
  )
}

-export default Home
+export default Page
```

## ここまでの画面
なにもなくなりました。
![](/images/firebase-chat-book/chapter1-02.png)

## TypeScriptの設定を変更しよう
`TypeScript`の設定は厳しければ厳しいほどいいですが、自分で設定を書くのは面倒くさいので`@tsconfig/strictest`を導入します。   
[Next.jsバージョン](https://github.com/tsconfig/bases#nextjs-tsconfigjson)もありますが、2022/10月地点では動かないので`@tsconfig/strictest`にしています。   
詳しい説明は下記の記事が参考になります。   
https://zenn.dev/yuta_ura/articles/introduce-tsconfig-bases

`pathのalias`の設定も忘れずにしましょう！   
`src`からのpathを`@src/`からの絶対パスで呼べるようになります。

```shell:ターミナル
$ yarn add -D @tsconfig/strictest
```

```diff json:tsconfig.json
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
-    "incremental": true
+    "incremental": true,
+    "baseUrl": ".",
+    "paths": {
+      "@src/*": ["src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}

```


## prettierを導入しよう
prettierが無いとつらいのでprettierを導入します。

### prettierの設定ファイルを作成しよう
```shell:ターミナル
$ touch .prettierrc
$ touch .prettierignore
```

```diff text:ディレクトリ
.
├── .eslintrc.json
├── .gitignore
+├── .prettierignore
+├── .prettierrc
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

### prettierをインストールしよう

```shell:ターミナル
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

## formatとlintの設定しよう

### npm-run-allをインストールしよう
```shell:ターミナル
$ yarn add -D npm-run-all
```

### package.jsonのscriptsにformatとlintの設定しよう

```json:package.json
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

### formatしよう
```shell
$ yarn format
```

## ここまでのディレクトリ

```text:ディレクトリ
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
└── yarn.lock
```

## Next.jsのセットアップが完了した地点のブランチ
https://github.com/hisho/zenn-firebase-chat-demo/tree/chapter1