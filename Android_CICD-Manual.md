# AndroidのCI/CD導入資料

```
・目次を入れる
・適宜画像での説明を追加
・構成を見直す
・導入にあたっての部分を加筆

```



## はじめに
本資料はGitLab上でAndroidのCI/CDを実現するための導入資料である。
AndroidのサンプルプロジェクトをベースにCI/CDの具体的な実現方法を説明する。


## 本資料のゴール
GitLab上でパイプラインを実行することで、Androidのアプリケーションのビルドが実行され、Firebase AppDistributionにアプリがデプロイできるCI/CDスクリプトが作成できるようになること。


## 必要知識
1. GitLab CI/CDに関する知識
2. Androidのビルド設定に関する知識
3. Firebase AppDistributionに関する知識


## 前提
1. Firebaseが導入されていること
2. バージョン管理をGitLabで行なっていること
3. GitLabのCI/CD変数の編集権限を持っていること


## 導入後のアプリ配信までのフロー
従来の人間が開発環境でビルドをして検証環境に成果物をアップロードしてアプリ配信を行うフローを以下のように改善できる。
人間が行うことは最初のパイプライン実行のみで、それ以降はCI/CDによって自動的に処理される。
また、ビルド環境がDockerに依存するため開発環境の違いによるトラブルを軽減できる。

1. GitLab上でパイプラインを実行
2. パイプライン完了まで10分程度待つ
3. Firebaseにアプリがデプロイされる


## CI/CDの概要
CI/CDは
本資料においてCIについては「静的解析」「テスト」「ビルド」を対象とし、CDについては「デプロイ」を対象とする。


## CI/CDスクリプトの構成

#### ジョブ定義に関する説明

```yml
build_hogehoge: 　　　 #　ジョブ名 
  stage: build        #　どのステージに属するのか
  dependencies:       #　ジョブ実行にあたっての前提ジョブ（先行して完了する必要があるジョブ）
    - unit_test
  before_script:      #　メインのスクリプト前に実行されるスクリプト
    - chmod +x ./gradlew
  script:             #　メインのスクリプトの記述部分
    - ./gradlew assembleDebug
  artifacts:          #　ジョブの成果物。成果物はzipでダウンロードが可能。
    paths:
      - app/build/outputs/apk/debug/app-debug.apk
    expire_in: 1 hour #　成果物の保存期間（長くし過ぎるとストレージを圧迫する）　
```

**※以下は構成の一例。プロジェクトによって必要なスクリプトは異なる**

#### ステージの定義
ステージでは明示的にどういったジョブがあるのか定義する（必須ではないが推奨される）。
本資料ではlint（静的解析）、test（ユニットテスト）、build（ビルド）、deploy（デプロイ）のステージとして定義する。

```yml
stages:
  - lint
  - test
  - build
  - deploy
```

#### 環境変数の定義
以下の変数定義によってパイプラインで実行する際にアプリの向き先や成果物（apk/aab）種別を選択できる。この変数定義は必須ではない。また、Firebaseにデプロイする際のリリースノートを任意の文字列で入力できる。
```yml
# ----------------------------------------
# 環境選択 (Web UI用)
# ----------------------------------------
variables:
  BUILD_VARIANT:
    value: "Debug"
    description: "ビルドするバリアントを選択してください"
    options:
      - "Debug"
      - "Release"
  
  GRADLE_TASK_PREFIX:
    value: "assemble"
    description: "outputを選択してください"
    options:
      - "assemble"
      - "bundle"

  RELEASE_NOTE_TEXT:
    value: ""
    description: "リリースノートに追記する任意のテキスト"
```


#### Dockerイメージの定義
GitLab上でCI/CDを実行するための実行環境をDockerで定義する。以下では「cimg社」の公開イメージを利用している。プロジェクトによってtargetAPIが異なるため、最適なイメージを利用する。なおCDにおいてFirebase CLIを利用するためにNodeJSがインストールしてある「-node」のイメージを利用する。

```yml
default:
  image: cimg/android:2026.01.1-node
```


#### 静的解析 (Lint)

一般的なAndroidプロジェクトであれば以下のスクリプトで性的解析が実行可能。成果物はジョブのArtifactとして出力され、完了後に別途ダウンロードできる。


```yml
lint_check:
  stage: lint
  before_script:
    - chmod +x ./gradlew
  script:
    - ./gradlew lint${BUILD_VARIANT}
  artifacts:
    when: always
    paths:
      - app/build/reports/lint-results-*.html
    expire_in: 1 week
```



#### ユニットテスト (Unit Test)

一般的なAndroidプロジェクトであれば以下のスクリプトで単体テストが実行可能。必要に応じてユニットテストコードを実装する。成果物はジョブのArtifactとして出力され、完了後に別途ダウンロードできる。

```yml
unit_test:
  stage: test
  before_script:
    - chmod +x ./gradlew
  script:
    - ./gradlew test${BUILD_VARIANT}UnitTest
  artifacts:
    when: always
    reports:
      junit: app/build/test-results/test${BUILD_VARIANT}UnitTest/TEST-*.xml
    paths:
      - app/build/reports/tests/test${BUILD_VARIANT}UnitTest/
    expire_in: 1 week

```

#### ビルド

一般的なAndroidプロジェクトであれば以下のスクリプトでビルドが実行可能。成果物を次のジョブのArtifactとして出力され、として利用する。また成果物の有効期限を1hに制限して、ストレージの圧迫を防ぐ。


```yml
build_android:
  stage: build
  dependencies:
    - build_android
  before_script:
    - chmod +x ./gradlew
  script:
    - ./gradlew ${GRADLE_TASK_PREFIX}${BUILD_VARIANT}
  artifacts:
    paths:
      - app/build/outputs/apk/**/*.apk
      - app/build/outputs/bundle/**/*.aab
    expire_in: 1 hour
```

#### デプロイ

Firebaseへのデプロイのスクリプト。ビルドジョブで作成された成果物（aab/apk）をFirebaseに対してデプロイする。デプロイにあたってFirebaseプロジェクトから秘密鍵を取得し、GitLabのCI/CD変数に設定しておく。下記スクリプトでは秘密鍵の内容をBase64でエンコードして変数に設定し、スクリプト内ででコードして利用している。主にデプロイを担当するスクリプトは`firebase appdistribution:distribute`の部分。

```yml
deploy_firebase:
  stage: deploy
  image: node:20-slim 
  dependencies:
    - replace_env
    - build_android
  before_script:    
    - npm install -g firebase-tools
  script:
    - |
      echo "$FIREBASE_SERVICE_ACCOUNT_KEY_B64" | base64 -d > /tmp/key.json
      export GOOGLE_APPLICATION_CREDENTIALS=/tmp/key.json
      
      FILE_PATH=$(find app/build/outputs -name "*.apk" -o -name "*.aab" | head -n 1)
      
      if [ -z "$FILE_PATH" ]; then
        echo "Error: Build artifact (.apk or .aab) not found!"
        exit 1
      fi
      
      echo "Deploying: $FILE_PATH"

      firebase appdistribution:distribute "$FILE_PATH" \
        --app "$FIREBASE_APP_ID" \
        --release-notes "${RELEASE_NOTE_TEXT}：$CI_COMMIT_SHORT_SHA" \
        --groups "group"
```







### `gitlab-ci.yml`の具体例

```yml
stages:
  - lint
  - test
  - build
  - deploy

# ----------------------------------------
# 環境選択 (Web UI用)
# ----------------------------------------
variables:
  BUILD_VARIANT:
    value: "Debug"
    description: "ビルドするバリアントを選択してください"
    options:
      - "Debug"
      - "Release"
  
  GRADLE_TASK_PREFIX:
    value: "assemble"
    description: "outputを選択してください"
    options:
      - "assemble"
      - "bundle"

  RELEASE_NOTE_TEXT:
    value: ""
    description: "リリースノートに追記する任意のテキスト"

# 共通設定
default:
  image: cimg/android:2026.01.1-node

# ----------------------------------------
# 1. 静的解析 (Lint)
# ----------------------------------------
lint_check:
  stage: lint
  before_script:
    - chmod +x ./gradlew
  script:
    - ./gradlew lint${BUILD_VARIANT}
  artifacts:
    when: always
    paths:
      - app/build/reports/lint-results-*.html
    expire_in: 1 week

# ----------------------------------------
# 2. ユニットテスト (Unit Test)
# ----------------------------------------
unit_test:
  stage: test
  dependencies:
    - replace_env
  before_script:
    - chmod +x ./gradlew
  script:
    - ./gradlew test${BUILD_VARIANT}UnitTest
  artifacts:
    when: always
    reports:
      junit: app/build/test-results/test${BUILD_VARIANT}UnitTest/TEST-*.xml
    paths:
      - app/build/reports/tests/test${BUILD_VARIANT}UnitTest/
    expire_in: 1 week

# ----------------------------------------
# 3. Androidアプリのビルド
# ----------------------------------------
build_android:
  stage: build
  dependencies:
    - replace_env
    - build_android
  before_script:
    - chmod +x ./gradlew
  script:
    - ./gradlew ${GRADLE_TASK_PREFIX}${BUILD_VARIANT}
  artifacts:
    paths:
      - app/build/outputs/apk/**/*.apk
      - app/build/outputs/bundle/**/*.aab
    expire_in: 1 hour

# ----------------------------------------
# 4. デプロイ (Firebase)
# ----------------------------------------  
deploy_firebase:
  stage: deploy
  image: node:20-slim 
  dependencies:
    - replace_env
    - build_android
  before_script:    
    - npm install -g firebase-tools
  script:
    - |
      echo "$FIREBASE_SERVICE_ACCOUNT_KEY_B64" | base64 -d > /tmp/key.json
      export GOOGLE_APPLICATION_CREDENTIALS=/tmp/key.json
      
      FILE_PATH=$(find app/build/outputs -name "*.apk" -o -name "*.aab" | head -n 1)
      
      if [ -z "$FILE_PATH" ]; then
        echo "Error: Build artifact (.apk or .aab) not found!"
        exit 1
      fi
      
      echo "Deploying: $FILE_PATH"

      firebase appdistribution:distribute "$FILE_PATH" \
        --app "$FIREBASE_APP_ID" \
        --release-notes "${RELEASE_NOTE_TEXT}：$CI_COMMIT_SHORT_SHA" \
        --groups "group"
```



### プロジェクト導入にあたっての準備

#### 現行のAndroidプロジェクトの設定の確認

1. プロジェクトのモジュール名、targetAPIの確認
2. ビルドバリアントの確認

#### Firebaseプロジェクトの設定

1. サービスアカウントの設定
2. 秘密鍵の取得


