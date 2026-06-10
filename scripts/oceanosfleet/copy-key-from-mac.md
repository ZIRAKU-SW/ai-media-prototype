# Mac → ZIRAKU VM へ oceanosfleet 用 SSH 鍵をコピー

Cursor の Remote SSH では Mac の `~/.ssh/config` で **dify-vm** に接続している:

```
Host dify-vm
    HostName 35.192.37.133
    User difyaifaq
    IdentityFile ~/.ssh/google_compute_engine
```

ZIRAKU VM からも同じ鍵で接続する。

## Mac で実行

```bash
# 1. 鍵があるか確認
ls -la ~/.ssh/google_compute_engine*
ssh dify-vm hostname

# 2. ZIRAKU VM へコピー
scp ~/.ssh/google_compute_engine ~/.ssh/google_compute_engine.pub gcp-vm:~/.ssh/
# gcp-vm が無い場合:
# scp ~/.ssh/google_compute_engine ~/.ssh/google_compute_engine.pub powerpass7@34.146.146.150:~/.ssh/
```

## ZIRAKU VM で実行

```bash
cd ~/ai-media-prototype
npm run oceanos:ssh-setup
chmod 600 ~/.ssh/google_compute_engine
npm run oceanos:ssh-test
npm run oceanos:update-proxy
```

## 別案（Mac から ZIRAKU 用の鍵を oceanosfleet に登録）

`google_compute_engine` をコピーしたくない場合:

```bash
# Mac — ZIRAKU VM の公開鍵を difyaifaq に登録
PUB=$(ssh gcp-vm "cat ~/.ssh/id_oceanos_deploy.pub")
ssh dify-vm "grep -qF '$PUB' ~/.ssh/authorized_keys 2>/dev/null || echo '$PUB' >> ~/.ssh/authorized_keys"
```

この場合 ZIRAKU VM は `id_oceanos_deploy` + User `difyaifaq` で接続。
