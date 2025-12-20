# 音源ファイルのダウンロード方法

## 現在の状況

- ✅ `fanfare.mp3` - 正常にダウンロード済み
- ❌ 他の6つのファイル - 手動でダウンロードが必要

## 手動ダウンロード手順

### 方法1: Pixabayから直接ダウンロード（推奨）

1. **Pixabay** (https://pixabay.com/music/) にアクセス
2. 検索バーで以下のキーワードを検索：
   - `bgm.mp3`: "christmas music" または "holiday music"
   - `tick.mp3`: "bell" または "tick"
   - `feint.mp3`: "question" または "confused"
   - `grab.mp3`: "sparkle" または "magic"
   - `applause.mp3`: "applause" または "clapping"
   - `jingle.mp3`: "jingle bells" または "christmas bell"
3. 適切な音源を見つけたら、**「ダウンロード」ボタン**をクリック
4. ダウンロードしたファイルを `public/sounds/` フォルダに配置
5. ファイル名を上記の名前に変更（例: `bgm.mp3`）

### 方法2: 他のフリー音源サイトを使用

#### Freesound (https://freesound.org/)
- アカウント作成が必要（無料）
- 検索してダウンロード

#### Zapsplat (https://www.zapsplat.com/)
- アカウント作成が必要（無料）
- 高品質な効果音が豊富

#### Incompetech (https://incompetech.com/music/royalty-free/)
- クリスマス音楽が豊富
- 直接ダウンロード可能

## 必要なファイル一覧

以下の7つのファイルを `public/sounds/` フォルダに配置してください：

1. `bgm.mp3` - BGM（クリスマスソング、ループ再生用）
2. `tick.mp3` - ルーレット回転音（短いベル音）
3. `feint.mp3` - フェイント音（短い疑問音）
4. `grab.mp3` - つまむ時の音（キラーン音）
5. `fanfare.mp3` - ✅ 既に配置済み
6. `applause.mp3` - 拍手歓声
7. `jingle.mp3` - ジングルベル

## 注意事項

- ファイル形式は **MP3** を推奨します
- ファイル名は正確に（大文字小文字を区別）
- 音源ファイルがない場合でも、アプリは動作しますが音声は再生されません
- `fanfare.mp3` は既に配置されているので、他の6つだけダウンロードすればOKです

## クイックテスト

音源ファイルを配置した後、ブラウザでアプリをリロードして、右上のBGMボタンをクリックしてみてください。音が再生されれば成功です！

