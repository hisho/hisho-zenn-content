---
title: "Firebaseをセットアップしよう"
---

# Firebaseをセットアップしよう
Firebaseのセットアップを行います。   
Firebaseのプロジェクトを作成し、`認証(Firebase Authentication)`とデータベース`(Firebase Realtime Database)`を有効にします。

## Firebaseのプロジェクトを作成しよう
[https://console.firebase.google.com](https://console.firebase.google.com)にアクセスし、`プロジェクトの作成`を押します。

![](/images/firebase-chat-book/chapter3-01.png)

プロジェクト名を入力し、`続行`を押します。   
ここでは`firebase-chat-test`という名前を入力しました。
![](/images/firebase-chat-book/chapter3-02.png)

Googleアナリティクスの設定をするか聞かれるのですが、今回は`無効`にして`プロジェクトを作成`を押します。
![](/images/firebase-chat-book/chapter3-03.png)

少し待つと下記の画面になるので`続行`を押します。

![](/images/firebase-chat-book/chapter3-04.png)

## アプリにFirebaseを追加しよう
プロジェクト作成後にアプリにFirebaseを追加する設定をします。   
今回はwebアプリなので、`ウェブ`のボタンを押します。
![](/images/firebase-chat-book/chapter3-05.png)

アプリのニックネームを入力します。   
ここでは`firebase-chat-test`という名前を入力しました。   
`アプリを登録`を押します。
![](/images/firebase-chat-book/chapter3-06.png)

Firebase SDKのセットアップをする画面が表示されます。   
Next.jsとの連携するのに必要な情報ですが、後で設定するのでここでは一旦`コンソールに進む`を押します。
![](/images/firebase-chat-book/chapter3-07.png)

## Firebase Authenticationを有効にしよう

Firebase Authenticationを有効にします。   
左の`構築`から`Authentication`を探してクリックします。
![](/images/firebase-chat-book/chapter3-08.png)

`始める`を押します。
![](/images/firebase-chat-book/chapter3-09.png)

今回はメールアドレス認証を使うので、`メール/パスワード`を押します。
![](/images/firebase-chat-book/chapter3-10.png)

`メール/パスワード`を有効にし、`続行`を押します
![](/images/firebase-chat-book/chapter3-11.png)

下記の画面のようになればOKです。
![](/images/firebase-chat-book/chapter3-12.png)

## Firebase Realtime Databaseを有効にしよう

Firebase Realtime Databaseを有効にします。   
左の`構築`から`Realtime Database`を探してクリックします。
![](/images/firebase-chat-book/chapter3-13.png)

`データベースを作成`を押します。
![](/images/firebase-chat-book/chapter3-14.png)

ロケーションの設定ですが、今回は`米国（us-central1）`を選択し、`次へ`を押します。
![](/images/firebase-chat-book/chapter3-15.png)

データベースのセキュリティルールを設定します。   
後から変更できるので、一旦`テストモードで開始する`を選択し、`有効にする`を押します。
![](/images/firebase-chat-book/chapter3-16.png)

下記の画面のようになればOKです。
![](/images/firebase-chat-book/chapter3-17.png)

以上でFirebaseのセットアップは完了です。