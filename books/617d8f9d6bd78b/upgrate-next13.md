---
title: "[アップグレード編]Next.js v13にアップデートしよう"
---

Next.js v12xで作成した方向けです。
https://nextjs.org/docs/upgrading


## Next.js v13にアップデートしよう

```shell
$ yarn upgrade-interactive --latest
```

対話形式で聞かれるので、nextとeslint-config-nextをスペースで選択してEnterを押します。
```shell
yarn upgrade-interactive v1.22.19
info Color legend :
 "<red>"    : Major Update backward-incompatible updates
 "<yellow>" : Minor Update backward-compatible features
 "<green>"  : Patch Update backward-compatible bug fixes
? Choose which packages to update.
 dependencies
   name                range   from        to        url
 ◯ @chakra-ui/react    latest  2.3.6    ❯  2.4.9     https://chakra-ui.com/
 ◯ @emotion/react      latest  11.10.4  ❯  11.10.5   https://github.com/emotion-js/emotion/tree/main#readme
 ◯ @emotion/styled     latest  11.10.4  ❯  11.10.5   https://github.com/emotion-js/emotion/tree/main#readme
 ◯ firebase            latest  9.12.1   ❯  9.15.0    https://firebase.google.com/
 ◯ framer-motion       latest  7.5.4    ❯  8.5.0     https://github.com/framer/motion#readme
 ◉ next                latest  12.3.1   ❯  13.1.2    https://nextjs.org
 ◯ pathpida            latest  0.18.1   ❯  0.20.1    https://github.com/aspida/pathpida#readme

 devDependencies
   name                range   from        to        url
 ◯ @types/node         latest  18.11.0  ❯  18.11.18  https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/node
 ◯ @types/react        latest  18.0.21  ❯  18.0.27   https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react
 ◯ @types/react-dom    latest  18.0.6   ❯  18.0.10   https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react-dom
 ◯ eslint              latest  8.25.0   ❯  8.32.0    https://eslint.org
❯◉ eslint-config-next  latest  12.3.1   ❯  13.1.2    https://github.com/vercel/next.js#readme
 ◯ prettier            latest  2.7.1    ❯  2.8.3     https://prettier.io
 ◯ typescript          latest  4.8.4    ❯  4.9.4     https://www.typescriptlang.org/
```

## 起動してみよう

```shell
$ yarn dev
```
起動すると下記のエラーが出ます。

`Error: Hydration failed because the initial UI does not match what was rendered on the server.`

![](/images/firebase-chat-book/upgrade-next13-01.png)

## アップグレードガイドを確認しよう
https://nextjs.org/docs/upgrading#v13-summary

- [x] The Supported Browsers have been changed to drop Internet Explorer and target modern browsers.
- [x] The minimum Node.js version has been bumped from 12.22.0 to 14.6.0, since 12.x has reached end-of-life.
- [x] The minimum React version has been bumped from 17.0.2 to 18.2.0.
- [x] The swcMinify configuration property was changed from false to true. See Next.js Compiler for more info.
- [x] The next/image import was renamed to next/legacy/image. The next/future/image import was renamed to next/image. A codemod is available to safely and automatically rename your imports.
- [ ] The next/link child can no longer be <a>. Add the legacyBehavior prop to use the legacy behavior or remove the <a> to upgrade. A codemod is available to automatically upgrade your code.
- [x] The target configuration property has been removed and superseded by Output File Tracing.


## 原因を特定しよう
アップグレードガイドを確認すると
`The next/link child can no longer be <a>. Add the legacyBehavior prop to use the legacy behavior or remove the <a> to upgrade. A codemod is available to automatically upgrade your code.`
が原因だとわかりました。

インスペクターで確認すると`Warning: Expected server HTML to contain a matching <a> in <a>.`と書いてあります。

![](/images/firebase-chat-book/upgrade-next13-02.png)

[[実装編]pathを型安全にしよう](/hisho/books/617d8f9d6bd78b/chapter13%252Emd)の項目で作成した`Nevigate`が原因だと分かりました。

## 修正しよう

chakraの公式によると既存の動きをしたい場合は`next.config.js`を追記すればいいみたいです。

```js:next.config.js
{
  experimental: { newNextLinkBehavior: false }
}
```

https://chakra-ui.com/docs/components/link#usage-with-nextjs

```diff js:next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, 
  swcMinify: true,
+ experimental: { newNextLinkBehavior: false },
}

module.exports = nextConfig
```

## 修正後の動き

![](/images/firebase-chat-book/upgrade-next13-03.png)

正常に動作することが確認できます。

![](/images/firebase-chat-book/upgrade-next13-04.gif)