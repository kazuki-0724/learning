# AndroidのCI/CD導入資料

```
・適宜画像での説明を追加
・構成を見直す
・導入にあたっての部分を加筆
```

- [AndroidのCI/CD導入資料](#androidのcicd導入資料)
  - [はじめに](#はじめに)
  - [本資料のゴール](#本資料のゴール)
  - [必要知識](#必要知識)
  - [前提](#前提)
  - [導入後のアプリ配信までのフロー](#導入後のアプリ配信までのフロー)
  - [CI/CDの概要](#cicdの概要)
    - [導入にあたっての準備](#導入にあたっての準備)
      - [ビルドバリアントの確認](#ビルドバリアントの確認)
      - [CI/CD変数の設定](#cicd変数の設定)
  - [CI/CDスクリプトの構成](#cicdスクリプトの構成)
      - [ジョブ定義に関する説明](#ジョブ定義に関する説明)
      - [ステージの定義](#ステージの定義)
      - [Dockerイメージの定義](#dockerイメージの定義)
      - [静的解析 (Lint)](#静的解析-lint)
      - [ユニットテスト (Unit Test)](#ユニットテスト-unit-test)
      - [ビルド](#ビルド)
      - [デプロイ](#デプロイ)
      - [具体例](#具体例)





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

### 導入にあたっての準備

#### ビルドバリアントの確認
モジュールレベルの`build.gradle`を参照し、必要なビルドタイプでCI/CDスクリプトを定義する。
以下はAndroidプロジェクトのデフォルト状態の場合に定義されているビルドタイプ。「debug」は明示的に定義せずに利用できる（特別な設定を行いたい場合は別途定義する）。
ビルドタイプはgradleを合わせて利用し、ビルドタイプが「debug」でapkを作成したい場合は「assembleDebug」、aabファイルを作成したい場合は「bundleDebug」など。
※releaseの場合は「Debug」が「Release」に置き換わる。

```gradle
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
```

#### CI/CD変数の設定

1. 秘密鍵（$FIREBASE_SERVICE_ACCOUNT_KEY_B64）
   Firebaseの「サービスアカウント」から秘密鍵を取得し、jsonの中身をBase64エンコードしたものを任意の名前でCI/CD変数に設定する。スクリプト側では自身が設定した名前で参照する。
2. アプリID（$FIREBASE_APP_ID）
   Firebaseの「設定」から参照できるアプリIDを取得する。秘密鍵と同様に任意の名前でCI/CD変数に設定し、スクリプトから参照する。

## CI/CDスクリプトの構成

#### ジョブ定義に関する説明

```yml
build_hogehoge: 　　　 #　ジョブ名 
  stage: build        #　どのステージに属するのか
  dependencies:       #　依存ジョブ
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


#### Dockerイメージの定義
GitLab上でCI/CDを実行するための実行環境をDockerで定義する。以下では「Cirrus CI」の公開イメージを利用している。プロジェクトによってtargetAPIが異なるため、最適なイメージを利用する。

```yml
default:
  image: cimg/android:2026.01.1-node
```


#### 静的解析 (Lint)

一般的なAndroidプロジェクトであれば以下のスクリプトで性的解析が実行可能。成果物はジョブのArtifactとして出力され、完了後に別途ダウンロードできる。


```yml
lint_check:
  stage: lint
  script:
    - bash ./gradlew lintDebug
  artifacts:
    when: always
    paths:
      - app/build/reports/lint-results-debug.html
    expire_in: 1 week
```



#### ユニットテスト (Unit Test)

一般的なAndroidプロジェクトであれば以下のスクリプトで単体テストが実行可能。必要に応じてユニットテストコードを実装する。成果物はジョブのArtifactとして出力され、完了後に別途ダウンロードできる。

```yml
unit_test:
  stage: test
  script:
    - bash ./gradlew testDebugUnitTest
  artifacts:
    when: always
    reports:
      junit: app/build/test-results/testDebugUnitTest/TEST-*.xml
    paths:
      - app/build/reports/tests/testDebugUnitTest/
    expire_in: 1 week
```

#### ビルド

一般的なAndroidプロジェクトであれば以下のスクリプトでビルドが実行可能。成果物を次のジョブのArtifactとして出力され、として利用する。また成果物の有効期限を1hに制限して、ストレージの圧迫を防ぐ。


```yml
build_android:
  stage: build
  script:
    - bash ./gradlew assembleDebug
  artifacts:
    paths:
      - app/build/outputs/apk/debug/app-debug.apk
    expire_in: 1 hour
```

#### デプロイ

Firebaseへのデプロイのスクリプト。ビルドジョブで作成された成果物（aab/apk）をFirebaseに対してデプロイする。デプロイにあたってFirebaseプロジェクトから秘密鍵を取得し、GitLabのCI/CD変数に設定しておく。下記スクリプトでは秘密鍵の内容をBase64でエンコードして変数に設定し、スクリプト内ででコードして利用している。主にデプロイを担当するスクリプトは`firebase appdistribution:distribute`の部分。

```yml
deploy_firebase:
  stage: deploy
  dependencies:
    - build_android
  cache:
    key: "$CI_COMMIT_REF_SLUG-android"
    policy: pull
  
  script:
    - |
      echo "$FIREBASE_SERVICE_ACCOUNT_KEY_B64" | base64 -d > /tmp/key.json
      export GOOGLE_APPLICATION_CREDENTIALS=/tmp/key.json
      
      # npx で firebase-tools パッケージを指定して実行
      # 初回はダウンロードされますが、npmのキャッシュが効く場合もあります
      npx --yes --package firebase-tools firebase appdistribution:distribute app/build/outputs/apk/debug/app-debug.apk \
        --app "$FIREBASE_APP_ID" \
        --release-notes "GitLab CI build: $CI_COMMIT_SHORT_SHA" \
        --groups "group"
```







#### 具体例

以下がAndroidにおけるCI/CDのスクリプト例。このスクリプトではジョブの高速化のためにキャッシュを有効にしている。


```yml
# ----------------------------------------
# パイプライン全体の実行条件
# ----------------------------------------
workflow:
  rules:
    - if: '$CI_PIPELINE_SOURCE == "web"'
      when: always
    - when: never

stages:
  - lint
  - test
  - build
  - deploy

# ----------------------------------------
# 共通設定 & 変数定義
# ----------------------------------------
default:
  image: cimg/android:2026.01.1-node
  before_script:
    - rm -f  .gradle/caches/modules-2/modules-2.lock
    - rm -fr .gradle/caches/*/plugin-resolution/

variables:
  GRADLE_USER_HOME: "$CI_PROJECT_DIR/.gradle"
  GRADLE_OPTS: "-Dorg.gradle.daemon=false"

cache:
  key: "$CI_COMMIT_REF_SLUG-android"
  paths:
    - .gradle/wrapper
    - .gradle/caches
  policy: pull-push

# ----------------------------------------
# 1. 静的解析 (Lint)
# ----------------------------------------
lint_check:
  stage: lint
  script:
    - bash ./gradlew lintDebug
  artifacts:
    when: always
    paths:
      - app/build/reports/lint-results-debug.html
    expire_in: 1 week

# ----------------------------------------
# 2. ユニットテスト (Unit Test)
# ----------------------------------------
unit_test:
  stage: test
  script:
    - bash ./gradlew testDebugUnitTest
  artifacts:
    when: always
    reports:
      junit: app/build/test-results/testDebugUnitTest/TEST-*.xml
    paths:
      - app/build/reports/tests/testDebugUnitTest/
    expire_in: 1 week

# ----------------------------------------
# 3. Androidアプリのビルド (APK生成)
# ----------------------------------------
build_android:
  stage: build
  script:
    - bash ./gradlew assembleDebug
  artifacts:
    paths:
      - app/build/outputs/apk/debug/app-debug.apk
    expire_in: 1 hour

# ----------------------------------------
# 4. Firebase App Distributionへアップロード
# ----------------------------------------
deploy_firebase:
  stage: deploy
  dependencies:
    - build_android
  cache:
    key: "$CI_COMMIT_REF_SLUG-android"
    policy: pull
  
  script:
    - |
      echo "$FIREBASE_SERVICE_ACCOUNT_KEY_B64" | base64 -d > /tmp/key.json
      export GOOGLE_APPLICATION_CREDENTIALS=/tmp/key.json
      
      npx --yes --package firebase-tools firebase appdistribution:distribute app/build/outputs/apk/debug/app-debug.apk \
        --app "$FIREBASE_APP_ID" \
        --release-notes "GitLab CI build: $CI_COMMIT_SHORT_SHA" \
        --groups "group"
```


