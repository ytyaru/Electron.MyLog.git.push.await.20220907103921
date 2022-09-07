# git pushエラー

```
Uncaught (in promise) Error: Error invoking remote method 'shell': Error: Command failed: git push origin master
fatal: not a git repository (or any parent up to mount point /)
Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).
```

# github.js

## init

```
git init
git remote add origin "https://${this.username}:${this.token}@github.com/${this.username}/${this.repo}.git"
https://docs.github.com/ja/rest/repos/repos#create-a-repository-for-the-authenticated-user
```

## push

```
git config --global user.name '${username}'
git config --global user.email '${email}'
```
```
git add .
git commit -m '${message}'
git push origin ${this.branch}
```

　`push`のところで以下エラーが出る。原因は`git remote add origin $URL`できていないこと。

```
Uncaught (in promise) Error: Error invoking remote method 'shell': Error: Command failed: cd "dst/mytestrepo"; git push origin master
fatal: 'origin' does not appear to be a git repository
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

　`push`のところで以下エラーが出る。原因はpushの直前でカレントディレクトリをリポジトリにしなかったこと。

```
Uncaught (in promise) Error: Error invoking remote method 'shell': Error: Command failed: git push origin master
fatal: not a git repository (or any parent up to mount point /)
Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).
```









なぜかgit pushを2回しないとアップされない問題

　simple-gitパッケージをやめてコマンド直打ちで実装し直した。それでも`git push`を2回すればアップできた。なぜ2回必要なのかは原因不明。

<!-- more -->

# ブツ

* [リポジトリ][]

[リポジトリ]:https://github.com/ytyaru/Electron.MyLog.git.push.20220903094945

## インストール＆実行

```sh
NAME='Electron.MyLog.git.push.20220903094945'
git clone https://github.com/ytyaru/$NAME
cd $NAME
npm install
npm start
```

### 準備

1. [GitHubアカウントを作成する](https://github.com/join)
1. `repo`スコープ権限をもった[アクセストークンを作成する](https://github.com/settings/tokens)
1. [インストール＆実行](#install_run)してアプリ終了する
	1. `db/setting.json`ファイルが自動作成される
1. `db/setting.json`に以下をセットしファイル保存する
	1. `username`:任意のGitHubユーザ名
	1. `email`:任意のGitHubメールアドレス
	1. `token`:`repo`スコープ権限を持ったトークン
	1. `repo`:任意リポジトリ名（`mytestrepo`等）
	1. `address`:任意モナコイン用アドレス（`MEHCqJbgiNERCH3bRAtNSSD9uxPViEX1nu`等）
1. `dst/mytestrepo/.git`が存在しないことを確認する（あれば`dst`ごと削除する）
1. GitHub上に同名リモートリポジトリが存在しないことを確認する（あれば削除する）

### 実行

1. `npm start`で起動またはアプリで<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd>キーを押す（リロードする）
1. `git init`コマンドが実行される
	* `repo/リポジトリ名`ディレクトリが作成され、その配下に`.git`ディレクトリが作成される
1. [createRepo][]実行後、リモートリポジトリが作成される

### GitHub Pages デプロイ

　アップロードされたファイルからサイトを作成する。

1. アップロードしたユーザのリポジトリページにアクセスする（`https://github.com/ユーザ名/リポジトリ名`）
1. 設定ページにアクセスする（`https://github.com/ユーザ名/リポジトリ名/settings`）
1. `Pages`ページにアクセスする（`https://github.com/ユーザ名/リポジトリ名/settings/pages`）
    1. `Source`のコンボボックスが`Deploy from a branch`になっていることを確認する
    1. `Branch`を`master`にし、ディレクトリを`/(root)`にし、<kbd>Save</kbd>ボタンを押す
    1. <kbd>F5</kbd>キーでリロードし、そのページに`https://ytyaru.github.io/リポジトリ名/`のリンクが表示されるまでくりかえす（***数分かかる***）
    1. `https://ytyaru.github.io/リポジトリ名/`のリンクを参照する（デプロイ完了してないと404エラー）

　すべて完了したリポジトリとそのサイトが以下。

* [作成DEMO][]
* [作成リポジトリ][]

[作成DEMO]:https://ytyaru.github.io/Electron.MyLog.git.push.Upload.Test.20220903094945/
[作成リポジトリ]:https://github.com/ytyaru/Electron.MyLog.git.push.Upload.Test.20220903094945

# 経緯

[Electron.MyLog.20220831094901]:https://github.com/ytyaru/Electron.MyLog.20220831094901
[Electron.simple.git.20220902105438]:https://github.com/ytyaru/Electron.simple.git.20220902105438

リポジトリ|結果
----------|----
[Electron.MyLog.20220831094901][]|なぜか`asset/`ディレクトリがアップされない（ローカルにはあるのに）
[Electron.simple.git.20220902105438][]|なぜか２回目のpushでアップされた

　simple-gitパッケージを使わず、gitコマンドを叩くだけでも、同じように2回目のpushでアップされるかもしれない。そう思って今回、試してみたところ、成功した。

# コード抜粋

## renderer.js

```javascript
const exists = await git.init(document.getElementById('github-repo').value)
if (!exists) { // .gitがないなら
    const res = await hub.createRepo({
        'name': `${setting.github.repo}`,
        'description': 'リポジトリの説明',
    }, setting)
    await maker.make()
    await git.push('新規作成')
    await git.push('なぜか初回pushではasset/ディレクトリなどがアップロードされないので２回やってみる') 
}
```

　アプリが起動したとき、かつローカルリポジトリが存在しない場合、以下のようにして必要なファイルをアップロードする。

1. `git init`して作成
1. リモートリポジトリ作成
1. サイト作成に必要なファイル一式を作成
1. `git push`する
1. なぜか初回だけだと全ファイルがアップされないので２回目の`git push`も直後に行う

　これで全ファイルがアップされた。2回`git push`が必要な理由が謎。

　とにかく、なぜか2回`git push`しないとファイルのアップロードが完了しないのはわかった。

　それはsimple-gitパッケージを使おうが、裸のコマンドで叩こうが同じ。ならパッケージがないほうがムダな依存関係を減らせるので助かる。というわけで、simple-gitパッケージは使わずに実装することにした。

　今後もまだまだ未知で謎で原因不明なバグが山ほど出てくる予感しかしない……。

## git.js

　コマンド直打ちしているコードは以下。最初にわざわざ毎回`cd`でカレントディレクトリをセットしている以外は、ふつうにコマンドを叩いている。

```javascript
class Git {
    async init(repo) {
        this.repo = repo
        const exists = await window.myApi.exists(`${this.dir}/${this.repo}/.git`)
        if(!exists) {
            await window.myApi.mkdir(`${this.dir}/${this.repo}`)
            let res = await window.myApi.shell(`cd "${this.dir}/${this.repo}/"; git init;`)
            res = await this.#remoteAddOrigin()
        } else {
            console.log(`${this.dir}/${this.repo}/.git は既存のためgit initしません。`)
        }
        return exists
    }
    async push(message='追記') {
        let res = await this.#setUser()
        res = await this.#add()
        res = await this.#commit(message)
        res = await this.#push()
    }
    async #setUser() {
        console.log('setUser():', this.username, this.email)
        const res1 = await window.myApi.shell(`git config --global user.name '${this.username}'`)
        const res2 = await window.myApi.shell(`git config --global user.email '${this.email}'`)
        return res1.stdout + '\n' + res2.stdout
    }
    async #add() {
        return await window.myApi.shell(`cd "${this.dir}/${this.repo}"; git add .;`)
    }
    async #addList() {
        return await window.myApi.shell(`cd "${this.dir}/${this.repo}"; git add -n .;`)
    }
    async #commit(message) {
        return await window.myApi.shell(`cd "${this.dir}/${this.repo}"; git commit -m '${message}';`)
    }
    async #remoteAddOrigin() {
        return await window.myApi.shell(`cd "${this.dir}/${this.repo}"; git remote add origin "https://${this.username}:${this.token}@github.com/${this.username}/${this.repo}.git";`)
    }
    async #remoteSetUrlOrigin() {
        return await window.myApi.shell(`cd "${this.dir}/${this.repo}"; git remote set-url origin "https://${this.username}:${this.token}@github.com/${this.username}/${this.repo}.git";`)
    }
    async #push() {
        return await window.myApi.shell(`cd "${this.dir}/${this.repo}"; git push origin ${this.branch}`)
    }
}
```










git push2回必要問題はawaitのせいではないはず

　今回、コードを見直してそれらしき箇所をみつけ修正したが、相変わらず2回pushしないと全ファイルがアップされない。原因不明。

<!-- more -->

# ブツ

* [リポジトリ][]

[リポジトリ]:https://github.com/ytyaru/Electron.MyLog.git.push.await.20220907103921

## インストール＆実行

```sh
NAME='Electron.MyLog.git.push.await.20220907103921'
git clone https://github.com/ytyaru/$NAME
cd $NAME
npm install
npm start
```

### 準備

1. [GitHubアカウントを作成する](https://github.com/join)
1. `repo`スコープ権限をもった[アクセストークンを作成する](https://github.com/settings/tokens)
1. `npm start`でアプリ起動し終了する（`db/setting.json`ファイルが自動作成される）
1. `db/setting.json`に以下をセットしファイル保存する
	1. `address`：任意のモナコイン用アドレス
	1. `username`：任意のGitHubユーザ名（デフォルト値：`git config --global user.name`）
	1. `email`：任意のGitHubメールアドレス（デフォルト値：`git config --global user.email`）
	1. `token`：`repo`スコープ権限を持ったトークン
	1. `repo.name`：任意リポジトリ名（デフォルト値：ルートディレクトリ名+`.Site`）
    1. 任意で以下もセットする
        1. `repo.description`: デフォルト値：`著者のつぶやきサイトです。`
        1. `repo.homepage`: （空なら自動で`https://${username}.github.io/${repo.name}/`）
1. `dst/mytestrepo/.git`が存在しないことを確認する（あれば`dst`ごと削除する）
1. GitHub上に同名リモートリポジトリが存在しないことを確認する（あれば削除するか別名にする）

### 実行

1. `npm start`で起動またはアプリで<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd>キーを押す（リロードする）
1. `git init`コマンドが実行される
	* `repo/リポジトリ名`ディレクトリが作成され、その配下に`.git`ディレクトリが作成される
1. [createRepo][]実行後、リモートリポジトリが作成される

### GitHub Pages デプロイ

　アップロードされたファイルからサイトを作成する。

1. アップロードしたユーザのリポジトリページにアクセスする（`https://github.com/ユーザ名/リポジトリ名`）
1. 設定ページにアクセスする（`https://github.com/ユーザ名/リポジトリ名/settings`）
1. `Pages`ページにアクセスする（`https://github.com/ユーザ名/リポジトリ名/settings/pages`）
    1. `Source`のコンボボックスが`Deploy from a branch`になっていることを確認する
    1. `Branch`を`master`にし、ディレクトリを`/(root)`にし、<kbd>Save</kbd>ボタンを押す
    1. <kbd>F5</kbd>キーでリロードし、そのページに`https://ytyaru.github.io/リポジトリ名/`のリンクが表示されるまでくりかえす（***数分かかる***）
    1. `https://ytyaru.github.io/リポジトリ名/`のリンクを参照する（デプロイ完了してないと404エラー）

### 結果

* [自動作成されたリポジトリを手動でデプロイしたサイト][]
* [自動作成されたリポジトリ][]

[自動作成されたリポジトリ]:https://github.com/ytyaru/Electron.MyLog.git.push.await.20220907103921.Site
[自動作成されたリポジトリを手動でデプロイしたサイト]:https://ytyaru.github.io/Electron.MyLog.git.push.await.20220907103921.Site/

# 経緯

* [Electronでgit pushできたが、なぜか一部アップされなかった][]
* [Electronでsimple-gitを試す][]
* [なぜかgit pushを2回しないとアップされない問題][]

[Electronでgit pushできたが、なぜか一部アップされなかった]:https://monaledge.com/article/512
[なぜかgit pushを2回しないとアップされない問題]:https://monaledge.com/article/515
[Electronでsimple-gitを試す]:https://monaledge.com/article/513

　Node.jsのAPIを介して`git`コマンドを叩いたり、simple-gitパッケージを介して叩いたりした。けれど結局どちらも2回`git push`しないと全ファイルがアップされないという謎の症状にみまわれた。

# 原因を考察する

　端末でgitコマンドを叩くときはふつうに一発でアップされる。2回`push`しないとアップされない症状など経験したことがない。よって`git`コマンドの問題ではないはず。

　なら、またしてもElectronやNode.js絡みの謎エラーなのか？　仮にそうだとして、一体何がどうなったら中途半端にアップされることになるのだろう。コマンドを間違えたらそもそも動作しないはずだし。想像できない。

　となると、私の書いたコードが間違っているはず。ありえるとしたら最初に疑った`async`/`await`。ファイルのコピーが完了する前に`push`されちゃった、とかそういう話なら理解できる。もう一度コードを見直してみよう。

# `await`まわりのコード

## renderer.js

```javascript
window.addEventListener('DOMContentLoaded', async(event) => {
    ....
    await maker.make()
    await git.push('新規作成')
    await git.push('なぜか初回pushではasset/ディレクトリなどがアップロードされないので２回やってみる') 
    ....
})
```

　`maker.make()`でサイトに必要なファイル一式を作成している。それを`await`で完了するまで待機してから`git push`している。なので、完了前に`push`されて一部アップされない、といったことは起こらないはず。

　なのに実際には起きちゃってる。もっと深くコードを追ってみよう。

## site-maker.js

　ファイル一式を作成するコード。

```javascript
    async make() { // 初回にリモートリポジトリを作成するとき一緒に作成する
        await Promise.all([
            this.#cp(`css/`),
            this.#cp(`asset/`),
            this.#cp(`db/mylog.db`),
            window.myApi.cp(`LICENSE.txt`, `dst/${this.setting.github.repo.name}/LICENSE.txt`, {'recursive':true, 'preserveTimestamps':true}),
            this.#readMeCode(),
            this.#indexCode(),
            window.myApi.cp(`src/js/app/github/export/style.css`, `dst/${this.setting.github.repo.name}/css/style.css`, {'recursive':true, 'preserveTimestamps':true}),
            window.myApi.cp(`src/js/app/github/export/main.js`, `dst/${this.setting.github.repo.name}/js/main.js`, {'recursive':true, 'preserveTimestamps':true}),
            window.myApi.cp(`src/lib/sql.js/1.7.0/sql-wasm.min.js`, `dst/${this.setting.github.repo.name}/lib/sql.js/1.7.0/sql-wasm.min.js`, {'recursive':true, 'preserveTimestamps':true}),
            window.myApi.cp(`src/lib/sql.js/1.7.0/sql-wasm.wasm`, `dst/${this.setting.github.repo.name}/lib/sql.js/1.7.0/sql-wasm.wasm`, {'recursive':true, 'preserveTimestamps':true}),
            window.myApi.cp(`src/lib/toastify/1.11.2/min.css`, `dst/${this.setting.github.repo.name}/lib/toastify/1.11.2/min.css`, {'recursive':true, 'preserveTimestamps':true}),
            window.myApi.cp(`src/lib/toastify/1.11.2/min.js`, `dst/${this.setting.github.repo.name}/lib/toastify/1.11.2/min.js`, {'recursive':true, 'preserveTimestamps':true}),
            window.myApi.cp(`src/js/app/github/export/sqlite-db-loader.js`, `dst/${this.setting.github.repo.name}/lib/mylog/sqlite-db-loader.js`, {'recursive':true, 'preserveTimestamps':true}),
            window.myApi.cp(`src/js/app/github/export/db-to-html.js`, `dst/${this.setting.github.repo.name}/lib/mylog/db-to-html.js`, {'recursive':true, 'preserveTimestamps':true}),
            window.myApi.cp(`src/js/app/github/export/run_server.py`, `dst/${this.setting.github.repo.name}/run_server.py`, {'recursive':true, 'preserveTimestamps':true}),
            window.myApi.cp(`src/js/app/github/export/server.sh`, `dst/${this.setting.github.repo.name}/server.sh`, {'recursive':true, 'preserveTimestamps':true}),
            window.myApi.cp(`src/js/app/github/export/.gitignore`, `dst/${this.setting.github.repo.name}/.gitignore`, {'recursive':true, 'preserveTimestamps':true}),
            this.#mpurseSendButtonCode(),
            window.myApi.cp(`src/lib/party/party.min.js`, `dst/${this.setting.github.repo.name}/lib/party/party.min.js`, {'recursive':true, 'preserveTimestamps':true}),
            window.myApi.cp(`src/js/util/party-sparkle-hart.js`, `dst/${this.setting.github.repo.name}/lib/monacoin/party-sparkle-image.js`, {'recursive':true, 'preserveTimestamps':true}),
            window.myApi.cp(`src/js/util/party-sparkle-image.js`, `dst/${this.setting.github.repo.name}/lib/monacoin/party-sparkle-hart.js`, {'recursive':true, 'preserveTimestamps':true}),
        ])
```

　以下で`await`していない箇所があった。もしや、このせいか？

```javascript
    async #cp(path) {
        ...
        window.myApi.cp(src, dst, {'recursive':true, 'preserveTimestamps':true})
    }
    async #mpurseSendButtonCode() { // デフォルトのアドレスを指定値に変更したファイルを作成・上書きする
        ...
        window.myApi.writeFile(`${dstDir}/${file}`, code)
    }
    async #readMeCode() {
        ...
        window.myApi.writeFile(`${dstDir}/${file}`, code)
    }
    async #indexCode() { // GitHubリポジトリ名をURLにぶちこむ
        ...
        window.myApi.writeFile(`${dstDir}/${file}`, code)
    }
    async #sqliteDbLoaderCode() {
        ...
        window.myApi.writeFile(`${dstDir}/${file}`, code)
    }
```

　コードのコメントアウトをみると以前は`await`していたけど削除したようだ。

　たぶん私の勘違いだろう。`Promise.all`の引数に渡すとき`await`してはならず、`Promise`を渡さねばならない。それをなにか勘違いして、間違った箇所で`await`を削除してしまったのだろう。

　以下のように`await`を付与するようコードを修正した。

```javascript
    async #cp(path) {
        ...
        await window.myApi.cp(src, dst, {'recursive':true, 'preserveTimestamps':true})
    }
    async #mpurseSendButtonCode() { // デフォルトのアドレスを指定値に変更したファイルを作成・上書きする
        ...
        await window.myApi.writeFile(`${dstDir}/${file}`, code)
    }
    async #readMeCode() {
        ...
        await window.myApi.writeFile(`${dstDir}/${file}`, code)
    }
    async #indexCode() { // GitHubリポジトリ名をURLにぶちこむ
        ...
        await window.myApi.writeFile(`${dstDir}/${file}`, code)
    }
    async #sqliteDbLoaderCode() {
        ...
        await window.myApi.writeFile(`${dstDir}/${file}`, code)
    }
```

　これで`await Promise.all([...])`の引数部分で上記メソッドを呼び出すとき`await`しなければ`Promise`が返るはず。それら複数の`Promise`を`all`の引数として渡してやれば、すべて完了するまで待機するようになるはず。

　これでよし。実際にアップロードしてみた。が、結局、変わらなかった……。

## git.js

　`git.push()`の中身もちゃんと`await`してある。

```javascript
    async push(message=null) {
        if (!message) { message = `追記:${new Date().toISOString()}` }
        let res = await this.#setUser()
        res = await this.#add()
        res = await this.#commit(message)
        res = await this.#push()
    }
    async #setUser(level='local') { // local, global, system
        if (!['local', 'global', 'system'].includes(level)) { alert(`db/setting.jsonファイルにGitHubユーザ名をセットしてください`, true); return false; }
        const res1 = await window.myApi.shell(`cd "${this.dir}/${this.setting.github.repo.name}/"; git config --${level} user.name '${this.setting.github.username}';`)
        const res2 = await window.myApi.shell(`cd "${this.dir}/${this.setting.github.repo.name}/"; git config --${level} user.email '${this.setting.github.email}';`)
        return res1.stdout + '\n' + res2.stdout
    }
    async #add() {
        return await window.myApi.shell(`cd "${this.dir}/${this.setting.github.repo.name}"; git add .;`)
    }
    async #addList() {
        return await window.myApi.shell(`cd "${this.dir}/${this.setting.github.repo.name}"; git add -n .;`)
    }
    async #commit(message) {
        return await window.myApi.shell(`cd "${this.dir}/${this.setting.github.repo.name}"; git commit -m '${message}';`)
    }
    async #remoteAddOrigin() {
        return await window.myApi.shell(`cd "${this.dir}/${this.setting.github.repo.name}"; git remote add ${this.remote} "https://${this.setting.github.username}:${this.setting.github.token}@github.com/${this.setting.github.username}/${this.setting.github.repo.name}.git";`)
    }
    async #remoteSetUrlOrigin() {
        return await window.myApi.shell(`cd "${this.dir}/${this.setting.github.repo.name}"; git remote set-url ${this.remote} "https://${this.setting.github.username}:${this.setting.github.token}@github.com/${this.setting.github.username}/${this.setting.github.repo.name}.git";`)
    }
    async #push() {
        return await window.myApi.shell(`cd "${this.dir}/${this.setting.github.repo.name}"; git push ${this.remote} ${this.branch}`)
    }
}
```

　`add`や`commit`が完了する前に`push`されちゃった、ということも起こらないはず。それぞれのコマンドでちゃんと`await`しているから。

　ファイル作成と`git`コマンドは、ちゃんと`await`しているはず。ならもう`await`は関係ないはず。一体なにが原因なんだ？

# ログ

　リポジトリ作成するとき2回`push`するよう実装している。

```javascript
await git.push('新規作成')
await git.push('なぜか初回pushではasset/ディレクトリなどがアップロードされないので２回やってみる') 
```

　このとき`commit`も行う。そのときのログと思しきものが以下。

　ログに出たファイル名を眺めていて思ったが、もしかしてindex.htmlでリンクされていない画像ファイルを除外しているのかな？　`git`コマンドにそんな余計なお節介する機能があるなんて聞いたことないけど。

### 1回目pushログ

```sh
[master (root-commit) 75e96dc] 新規作成
 21 files changed, 863 insertions(+)
 create mode 100644 .gitignore
 create mode 100644 LICENSE.txt
 create mode 100644 README.md
 create mode 100644 asset/image/avator.png
 create mode 100644 asset/image/eye-catch.png
 create mode 100644 css/style.css
 create mode 100644 db/mylog.db
 create mode 100644 index.html
 create mode 100644 js/main.js
 create mode 100644 lib/monacoin/mpurse-send-button.js
 create mode 100644 lib/monacoin/party-sparkle-hart.js
 create mode 100644 lib/monacoin/party-sparkle-image.js
 create mode 100644 lib/mylog/db-to-html.js
 create mode 100644 lib/mylog/sqlite-db-loader.js
 create mode 100644 lib/party/party.min.js
 create mode 100644 lib/sql.js/1.7.0/sql-wasm.min.js
 create mode 100644 lib/sql.js/1.7.0/sql-wasm.wasm
 create mode 100644 lib/toastify/1.11.2/min.css
 create mode 100644 lib/toastify/1.11.2/min.js
 create mode 100644 run_server.py
 create mode 100755 server.sh
```

　じつは初回コミットだけは21ファイルしかコミットできない、とかいう制約があったりするのか？　もしくはファイルサイズ上限？　そんなの聞いたことがない。

### 2回目pushログ

　頭の悪そうなコミットメッセージよ……。

```sh
[master c84041e] なぜか初回pushではasset/ディレクトリなどがアップロードされないので２回やってみる
 63 files changed, 470 insertions(+)
 create mode 100644 asset/image/github.svg
 create mode 100644 asset/image/mastodon_mascot.svg
 create mode 100644 asset/image/misskey.png
 create mode 100644 asset/image/monacoin/png/256/coin-mark-black.png
 create mode 100644 asset/image/monacoin/png/256/coin-mark.png
 create mode 100644 asset/image/monacoin/png/256/coin-mini-monar-mouth-red.png
 create mode 100644 asset/image/monacoin/png/256/coin-mini-monar.png
 create mode 100644 asset/image/monacoin/png/256/coin-monar-mouth-red.png
 create mode 100644 asset/image/monacoin/png/256/coin-monar.png
 create mode 100644 asset/image/monacoin/png/256/mark-outline.png
 create mode 100644 asset/image/monacoin/png/256/mark.png
 create mode 100644 asset/image/monacoin/png/256/monar-mark-white.png
 create mode 100644 asset/image/monacoin/png/256/monar-mark.png
 create mode 100644 asset/image/monacoin/png/256/monar-mouth-red.png
 create mode 100644 asset/image/monacoin/png/256/monar-no-face.png
 create mode 100644 asset/image/monacoin/png/256/monar-transparent.png
 create mode 100644 asset/image/monacoin/png/256/monar.png
 create mode 100644 asset/image/monacoin/png/64/coin-mark-black.png
 create mode 100644 asset/image/monacoin/png/64/coin-mark.png
 create mode 100644 asset/image/monacoin/png/64/coin-mini-monar-mouth-red.png
 create mode 100644 asset/image/monacoin/png/64/coin-mini-monar.png
 create mode 100644 asset/image/monacoin/png/64/coin-monar-mouth-red.png
 create mode 100644 asset/image/monacoin/png/64/coin-monar.png
 create mode 100644 asset/image/monacoin/png/64/mark-outline.png
 create mode 100644 asset/image/monacoin/png/64/mark.png
 create mode 100644 asset/image/monacoin/png/64/monar-mark-white.png
 create mode 100644 asset/image/monacoin/png/64/monar-mark.png
 create mode 100644 asset/image/monacoin/png/64/monar-mouth-red.png
 create mode 100644 asset/image/monacoin/png/64/monar-no-face.png
 create mode 100644 asset/image/monacoin/png/64/monar-transparent.png
 create mode 100644 asset/image/monacoin/png/64/monar.png
 create mode 100644 asset/image/monacoin/svg/coin-mark-black.svg
 create mode 100644 asset/image/monacoin/svg/coin-mark.svg
 create mode 100644 asset/image/monacoin/svg/coin-mini-monar-mouth-red.svg
 create mode 100644 asset/image/monacoin/svg/coin-mini-monar.svg
 create mode 100644 asset/image/monacoin/svg/coin-monar-mouth-red.svg
 create mode 100644 asset/image/monacoin/svg/coin-monar.svg
 create mode 100644 asset/image/monacoin/svg/mark-outline.svg
 create mode 100644 asset/image/monacoin/svg/mark.svg
 create mode 100644 asset/image/monacoin/svg/monar-mark-white.svg
 create mode 100644 asset/image/monacoin/svg/monar-mark.svg
 create mode 100644 asset/image/monacoin/svg/monar-mouth-red.svg
 create mode 100644 asset/image/monacoin/svg/monar-no-face.svg
 create mode 100644 asset/image/monacoin/svg/monar-transparent.svg
 create mode 100644 asset/image/monacoin/svg/monar.svg
 create mode 100644 asset/image/user/kkrn_icon_user_1.svg
 create mode 100644 asset/image/user/kkrn_icon_user_10.svg
 create mode 100644 asset/image/user/kkrn_icon_user_11.svg
 create mode 100644 asset/image/user/kkrn_icon_user_12.svg
 create mode 100644 asset/image/user/kkrn_icon_user_13.svg
 create mode 100644 asset/image/user/kkrn_icon_user_14.svg
 create mode 100644 asset/image/user/kkrn_icon_user_2.svg
 create mode 100644 asset/image/user/kkrn_icon_user_3.svg
 create mode 100644 asset/image/user/kkrn_icon_user_3_my.svg
 create mode 100644 asset/image/user/kkrn_icon_user_3_resize.svg
 create mode 100644 asset/image/user/kkrn_icon_user_3_resize_min.svg
 create mode 100644 asset/image/user/kkrn_icon_user_4.svg
 create mode 100644 asset/image/user/kkrn_icon_user_5.svg
 create mode 100644 asset/image/user/kkrn_icon_user_6.svg
 create mode 100644 asset/image/user/kkrn_icon_user_7.svg
 create mode 100644 asset/image/user/kkrn_icon_user_8.svg
 create mode 100644 asset/image/user/kkrn_icon_user_9.svg
 create mode 100644 asset/image/user/url.md
```

　なぜこのファイルたちは1回目の`push`でアップされないの？　謎。

　この中にある`.../png/64/coin-monar.png`ファイルは、投げモナボタンの表示に使う画像なのに。

# ついでにバグ修正

## setting.js

　末尾に改行コードが付与してしまうバグを発見したので修正した。`shell`コマンド実行結果の標準出力`stdout`だと末尾に改行コードが付与されたままらしい。なので`trim()`した。

```javascript
const username = await window.myApi.shell(`git config --global user.name`)
const email = await window.myApi.shell(`git config --global user.email`)
```
```javascript
username:username.stdout.trim(),email:email.stdout.trim()
```

# 所感

　結局、2回`git push`しないと全ファイルがアップされない問題の原因はわからないまま。orz







```javascript
```


```javascript
```




## 

```javascript
```


## 

```javascript
```


## 

```javascript
```


## 

```javascript
```


## 

```javascript
```

## 

```javascript
await maker.make()
```

