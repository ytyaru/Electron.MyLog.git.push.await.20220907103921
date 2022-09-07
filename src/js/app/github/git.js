class Git {
    constructor(setting) {
        this.setting = setting
        this.dir = `dst`
        this.remote = `origin`
        this.branch = `master`
    }
    async init() {
        console.log('Git.init()')
        if (!this.#validInit()) { return }
        const exists = await window.myApi.exists(`${this.dir}/${this.setting.github.repo.name}/.git`)
        console.log(exists)
        if(!exists) {
            await window.myApi.mkdir(`${this.dir}/${this.setting.github.repo.name}`)
            let res = await window.myApi.shell(`cd "${this.dir}/${this.setting.github.repo.name}/"; git init;`)
            console.log(res.stdout)
            console.log(`ローカルリポジトリを作成しました。`)
            res = await this.#remoteAddOrigin()
            console.log(res.stdout)
        } else {
            console.log(`${this.dir}/${this.setting.github.repo.name}/.git は既存のためgit initしません。`)
        }
        return exists
    }
    async #validInit() {
        if (!this.setting.github.username) { alert(`db/setting.jsonファイルにGitHubユーザ名をセットしてください`, true); return false; }
        if (!this.setting.github.email) { alert(`db/setting.jsonファイルにGitHubメールアドレスをセットしてください`, true); return false; }
        if (!this.setting.github.token) { alert(`db/setting.jsonファイルにGitHubアクセストークンをセットしてください\nrepoスコープ権限をもっている必要があります`, true); return false; }
        if (!this.setting.github.repo.name) { alert(`db/setting.jsonファイルにGitHubリポジトリ名をセットしてください\n100字以内で英数字・記号は._-の3つのみ使用可`, true); return false; }
        return true
    }
    async push(message=null) {
        if (!message) { message = `追記:${new Date().toISOString()}` }
        let res = await this.#setUser()
        console.log(res.stdout)
        res = await this.#add()
        console.log(res.stdout)
        res = await this.#commit(message)
        console.log(res.stdout)
        res = await this.#push()
        console.log(res.stdout)
    }
    // これやらないとcommit時以下エラーになる
    // Uncaught (in promise) Error: Error invoking remote method 'shell': Error: Command failed: git push origin master
    // fatal: not a git repository (or any parent up to mount point /)
    // Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).
    async #setUser(level='local') { // local, global, system
        console.log('setUser():', this.setting.github.username, this.setting.github.email, level)
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
