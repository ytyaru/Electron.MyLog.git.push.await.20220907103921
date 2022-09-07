window.addEventListener('DOMContentLoaded', async(event) => {
    console.log('DOMContentLoaded!!');
    await window.myApi.loadDb(`src/db/mylog.db`)
    const db = new MyLogDb()
    Loading.setup()
    let setting = await Setting.load()
    console.log(setting)
    const maker = new SiteMaker(setting)
    if (setting?.mona?.address) { document.getElementById('address').value = setting.mona.address }
    if (setting?.github?.username) { document.getElementById('github-username').value =  setting?.github?.username }
    if (setting?.github?.email) { document.getElementById('github-email').value =  setting?.github?.email }
    if (setting?.github?.token) { document.getElementById('github-token').value = setting?.github?.token }
    if (setting?.github?.repo?.name) { document.getElementById('github-repo-name').value = setting?.github?.repo?.name }

    // https://www.electronjs.org/ja/docs/latest/api/window-open
    document.querySelector('#open-repo').addEventListener('click', async()=>{
        window.open(`https://github.com/${document.getElementById('github-username').value}/${document.getElementById('github-repo-name').value}`, `_blank`)
    })
    document.querySelector('#open-site').addEventListener('click', async()=>{
        window.open(setting.github.repo.homepage, `_blank`)
    })
    //const git = new Git(setting?.github)
    //const hub = new GitHub(setting?.github)
    const git = new Git(setting)
    const hub = new GitHub(setting)
    document.querySelector('#post').addEventListener('click', async()=>{
        const insHtml = await db.insert(document.getElementById('content').value)
        if (!insHtml) { return }
        document.getElementById('post-list').innerHTML = insHtml + document.getElementById('post-list').innerHTML
        document.querySelector('#post').value = ''
        const exists = await git.init(document.getElementById('github-repo-name').value)
        //return // デバッグ
        if (!exists) { // .gitがないなら
            //await maker.make()
            console.log(`リクエスト開始`)
            console.log(setting.github.username)
            console.log(setting.github.token)
            console.log(setting.github.repo)
            const res = await hub.createRepo({
                'name': document.getElementById('github-repo-name').value,
                'description': setting.github.repo.description,
                'homepage': setting.github.repo.homepage,
            })
            console.log(res)
            await maker.make()
            await git.push('新規作成')
            await git.push('なぜか初回pushではasset/ディレクトリなどがアップロードされないので２回やってみる') 
        }
        else { await git.push() }
    })
    document.querySelector('#delete').addEventListener('click', async()=>{
        const ids = Array.from(document.querySelectorAll(`#post-list input[type=checkbox][name=delete]:checked`)).map(d=>parseInt(d.value))
        console.debug(ids)
        await db.delete(ids)
        document.getElementById('post-list').innerHTML = await db.toHtml()
        await git.push()
    })
    document.querySelector('#save-setting').addEventListener('click', async()=>{
        setting = await Setting.load()
        setting.mona.address = document.getElementById('address').value
        setting.github.username = document.getElementById('github-username').value
        setting.github.email = document.getElementById('github-email').value
        setting.github.token = document.getElementById('github-token').value
        setting.github.repo.name = document.getElementById('github-repo-name').value
        //setting.github.repo.description = document.getElementById('github-repo-description').value
        //setting.github.repo.homepage = document.getElementById('github-repo-homepage').value
        //setting.github.repo.topics = document.getElementById('github-repo-topics').value
        await Setting.save(setting)
        /*
        await Setting.save({
            mona:{address:document.getElementById('address').value},
            github:{
                username:document.getElementById('github-username').value,
                token:document.getElementById('github-token').value,
                repo:document.getElementById('github-repo').value,
            }
        })
        */
        console.log(`設定ファイルを保存した`)
    })
    document.getElementById('post-list').innerHTML = await db.toHtml(document.getElementById('address').value)
    document.getElementById('content').focus()
    document.getElementById('content-length').textContent = db.LENGTH;
    /*
    document.querySelector('#download')?.addEventListener('click', async()=>{
        await downloader.download()
    })
    */
    /*
    document.querySelector('#save-setting').addEventListener('click', async()=>{
        await Setting.save(
            {
                mona:{address:document.getElementById('address').value},
                github:{
                    username:document.getElementById('github-username').value,
                    token:document.getElementById('github-token').value,
                    repository:document.getElementById('github-repository').value,
                }
            })
    })

    /*
    await window.myApi.loadDb(`src/db/mylog.db`)
    const db = new MyLogDb()
//    const downloader = new MyLogDownloader(db)
//    const uploader = new MyLogUploader(db, sqlFile)
    //const LENGTH = 140
    //const LINE = 15
    Loading.setup()
    const setting = await Setting.load()
    console.log(setting)
    console.log(setting?.mona?.address)
    //uploader.setup()
    if (setting?.mona?.address) { document.getElementById('address').value = setting.mona.address }
    if (setting?.github?.username) { document.getElementById('github-username').value =  setting?.github?.username }
    if (setting?.github?.token) { document.getElementById('github-token').value = setting?.github?.token }
    if (setting?.github?.repository) { document.getElementById('github-repository').value = setting?.github?.repository }
    const params = {
        params: {
            method: 'GET',
            url: `https://api.github.com/users/${setting.github.username}`,
            headers: {
                'Content-Type': 'application/json',
                Authorization: "Bearer " + setting.github.token,
            },
        },
        onData:async(json, res)=>{
            console.debug(res)
            console.debug(json)
        },
        onEnd:async(res)=>{
            console.debug(res)
        },
    }
    console.log(params)
    await window.myApi.request(params) // Uncaught (in promise) Error: An object could not be cloned.
    document.getElementById('post-list').innerHTML = await db.toHtml(document.getElementById('address').value)
    document.getElementById('content').focus()
    document.getElementById('content-length').textContent = db.LENGTH;
    document.querySelector('#post').addEventListener('click', async()=>{
        document.getElementById('post-list').innerHTML = 
            db.insert(document.getElementById('content').value)
            + document.getElementById('post-list').innerHTML
    })
    document.querySelector('#delete').addEventListener('click', async()=>{
        const ids = Array.from(document.querySelectorAll(`#post-list input[type=checkbox][name=delete]:checked`)).map(d=>parseInt(d.value))
        console.debug(ids)
        await db.delete(ids)
        document.getElementById('post-list').innerHTML = await db.toHtml()
    })
    */
    /*
    document.querySelector('#download')?.addEventListener('click', async()=>{
        await downloader.download()
    })
    */
    /*
    document.querySelector('#save-setting').addEventListener('click', async()=>{
        await Setting.save(
            {
                mona:{address:document.getElementById('address').value},
                github:{
                    username:document.getElementById('github-username').value,
                    token:document.getElementById('github-token').value,
                    repository:document.getElementById('github-repository').value,
                }
            })
    })
    */
})
