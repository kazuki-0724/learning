const axios = require('axios');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const prompts = require('prompts');

// --- 設定: ダウンロード ---
const BASE_DOWNLOAD_DIR = './downloaded_repos';
// 最大チャンクサイズを512KBに設定
const MAX_CHUNK_SIZE_BYTES = 512 * 1024; 

// --- 設定: ファイルフィルタリング
const SOURCE_EXTENSIONS = new Set([
  'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'hpp',
  'html', 'css', 'scss', 'less', 'json', 'xml', 'yaml', 'yml', 'md',
  'php', 'go', 'rb', 'swift', 'kt', 'rs', 'vue', 'svelte', 'sh',
  'txt', 'conf', 'config', 'ini', 'env', 'toml',
  'sql', 'graphql',
]);
const EXCLUDE_DIRS = new Set([
  '.git', '.vscode', 'node_modules', 'dist', 'build', 'out', 'temp', 'tmp',
  '__pycache__', '.idea', 'vendor', '.next', '.nuxt', '.svelte-kit', '.angular',
  '__MACOSX', 'bin', 'obj', 'target', 'venv', '.venv'
]);
const EXCLUDE_FILES = new Set([
  '.DS_Store', 'Thumbs.db', 'package-lock.json', 'yarn.lock', 'npm-debug.log',
  'Makefile', 'CMakeLists.txt', 'Gemfile.lock', 'pom.xml', 'gradlew', 'gradlew.bat',
  'webpack.config.js', 'rollup.config.js', 'vite.config.js',
  'code_markdowned.js'
]);
const LANGUAGE_MAP = {
  'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
  'py': 'python', 'java': 'java', 'c': 'c', 'cpp': 'cpp', 'h': 'c', 'hpp': 'cpp',
  'html': 'html', 'css': 'css', 'scss': 'scss', 'less': 'less', 'json': 'json',
  'xml': 'xml', 'yaml': 'yaml', 'yml': 'yaml', 'md': 'markdown', 'php': 'php',
  'go': 'go', 'rb': 'ruby', 'swift': 'swift', 'kt': 'kotlin', 'rs': 'rust',
  'vue': 'vue', 'svelte': 'svelte', 'sh': 'bash', 'txt': 'text', 'sql': 'sql',
  'graphql': 'graphql', 'conf': 'text', 'config': 'text', 'ini': 'ini', 
  'env': 'bash', 'toml': 'toml', 'gitignore': 'text', 'gitattributes': 'text', 
  'npmrc': 'text', 'yarnrc': 'text'
};


// --- 関数: Markdown生成ロジック
function collectAllFiles(currentPath, relativePath, allFileContents) {
  try {
    const files = fs.readdirSync(currentPath);
    files.forEach(file => {
      const fullPath = path.join(currentPath, file);
      const currentRelativePath = path.join(relativePath, file);
      const stats = fs.statSync(fullPath);
      if (stats.isFile()) {
        const fileName = path.basename(file);
        const fileExtension = path.extname(file).slice(1).toLowerCase();
        if (EXCLUDE_FILES.has(fileName)) return;
        if (SOURCE_EXTENSIONS.has(fileExtension)) {
          try {
            const fileContent = fs.readFileSync(fullPath, 'utf8');
            const langName = LANGUAGE_MAP[fileExtension] || '';
            let formattedContent = `---\n\n`;
            formattedContent += `### ファイル: ${currentRelativePath.replace(/\\/g, '/')}\n\n`;
            formattedContent += `\`\`\`${langName}\n`;
            formattedContent += fileContent.trim() + '\n';
            formattedContent += `\`\`\`\n\n`;
            allFileContents.push(formattedContent);
          } catch (readError) {
            console.error(`エラー: ${currentRelativePath} の読み取り中に問題が発生しました: ${readError.message}`);
          }
        }
      } else if (stats.isDirectory()) {
        const dirName = path.basename(fullPath);
        if (!EXCLUDE_DIRS.has(dirName)) {
          collectAllFiles(fullPath, currentRelativePath, allFileContents);
        }
      }
    });
  } catch (dirReadError) {
    console.error(`エラー: ディレクトリ '${currentPath}' の読み取り中に問題が発生しました: ${dirReadError.message}`);
  }
}

function cleanupDirectory(directoryPath, fileToKeepName) {
    console.log(`\n出力ディレクトリのクリーンアップ処理を開始します...`);
    try {
        if (!fs.existsSync(directoryPath)) return;
        const files = fs.readdirSync(directoryPath);
        const baseNameToKeep = path.basename(fileToKeepName, '.md');
        files.forEach(file => {
            const filePath = path.join(directoryPath, file);
            if (file !== fileToKeepName && !file.startsWith(baseNameToKeep + '_part_') && fs.statSync(filePath).isFile()) {
                fs.unlinkSync(filePath);
            }
        });
        console.log(`古いファイルのクリーンアップ完了`);
    } catch (error) {
        console.error(`クリーンアップ中にエラーが発生しました: ${error.message}`);
    }
}

function generateMarkdown(targetDir, outputDir) {
  const absoluteTargetPath = path.resolve(targetDir);
  const repoName = path.basename(absoluteTargetPath);
  const allFileContents = [];
  const outputDirPath = path.resolve(outputDir);
  const outputFilePath = path.join(outputDirPath, `${repoName}.md`);

  console.log(`\nMarkdown生成を開始します... -> ${path.basename(outputFilePath)}`);

  if (!fs.existsSync(absoluteTargetPath)) {
    console.error(`エラー: 指定されたディレクトリが存在しません: ${absoluteTargetPath}`);
    return null;
  }

  fs.mkdirSync(outputDirPath, { recursive: true });

  collectAllFiles(absoluteTargetPath, repoName, allFileContents);

  if (allFileContents.length > 0) {
    const combinedMarkdown = `# ${repoName} ディレクトリのソースコード\n\n` + allFileContents.join('');
    fs.writeFileSync(outputFilePath, combinedMarkdown, 'utf8');

    // クリーンアップ処理は、分割処理の前に実行
    cleanupDirectory(outputDirPath, path.basename(outputFilePath));

    console.log(`結合ファイル生成完了！`);
    return outputFilePath; // 生成された単一ファイルのパスを返す
  } else {
    console.log(`\n警告: ソースファイルが見つかりませんでした。`);
    return null;
  }
}

// --- MDファイル分割ロジック ---
function splitMarkdownFile(inputPath, outputDir, repoName) {
    console.log(`\nAIサイズ分割を開始します (最大 ${MAX_CHUNK_SIZE_BYTES / 1024} KB)...`);

    if (!inputPath || !fs.existsSync(inputPath)) {
        console.error('エラー: 分割対象のファイルが見つかりません。');
        return;
    }

    const content = fs.readFileSync(inputPath, 'utf8');
    const outputDirPath = path.resolve(outputDir);
    const contentBuffer = Buffer.from(content, 'utf8');
    
    // 1. メインヘッダーを取得 (例: # ディレクトリ名 のソースコード)
    const headerMatch = content.match(/^(# [^\n]*\n\n)/);
    const header = headerMatch ? headerMatch[0] : '';

    // 2. ファイルセクションを抽出 (---で区切られた各ファイルのMarkdownブロック)
    // 最初のセクションはヘッダーなのでスキップし、残りのセクションを取得
    const fileSections = content.split('\n---\n\n').slice(1).filter(s => s.trim() !== '');

    if (fileSections.length === 0) {
        console.log('分割対象のソースコードセクションが見つかりませんでした。');
        return;
    }

    let currentChunkContent = header;
    let currentChunkSize = Buffer.byteLength(header, 'utf8');
    let partIndex = 1;

    for (const section of fileSections) {
        // 現在のセクションの内容を復元 ('\n---\n\n' + section)
        const fullSection = '\n---\n\n' + section;
        const sectionSize = Buffer.byteLength(fullSection, 'utf8');

        // サイズチェック: 現在のチャンクに追加しても制限を超えないか？
        if (currentChunkSize + sectionSize <= MAX_CHUNK_SIZE_BYTES) {
            // 超えない場合: 追加してサイズを更新
            currentChunkContent += fullSection;
            currentChunkSize += sectionSize;
        } else {
            // 超える場合: 
            // 1. 現在のチャンクをファイルに出力
            const outputFilePath = path.join(outputDirPath, `${repoName}_part_${partIndex}.md`);
            fs.writeFileSync(outputFilePath, currentChunkContent, 'utf8');
            console.log(`Part ${partIndex} (${(currentChunkSize / 1024).toFixed(1)} KB) 出力: ${path.basename(outputFilePath)}`);
            
            // 2. 新しいチャンクを開始 (ヘッダーを忘れずに追加)
            partIndex++;
            currentChunkContent = header + fullSection; // 新しいパートの先頭にもヘッダーを付与
            currentChunkSize = Buffer.byteLength(currentChunkContent, 'utf8');
            
            // 補足: 単一ファイルでもサイズ制限を超えているか？ (今回は無視して、そのまま次のチャンクとして書き出す)
        }
    }

    // 最後のチャンクをファイルに出力
    if (currentChunkSize > Buffer.byteLength(header, 'utf8')) {
        const outputFilePath = path.join(outputDirPath, `${repoName}_part_${partIndex}.md`);
        fs.writeFileSync(outputFilePath, currentChunkContent, 'utf8');
        console.log(`Part ${partIndex} (${(currentChunkSize / 1024).toFixed(1)} KB) 出力: ${path.basename(outputFilePath)}`);
    }

    console.log(`\n分割処理が完了しました。全 ${partIndex} ファイルに分割されました。`);
}


async function readArgsFromFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split('\n');

    const urlLines = lines.filter(line => line.trim().startsWith('url'));
    const urls = urlLines.map(line => line.split('=')[1]?.trim()).filter(Boolean);

    const tokenLine = lines.find(line => line.trim().startsWith('token'));
    const token = tokenLine ? tokenLine.split('=')[1]?.trim() : null;

    console.log(`読み込み結果:`);
    console.log(`  URLs: ${urls.length > 0 ? urls.join(', ') : '(none)'}`);
    console.log(`  Token: ${token ? '***' : '(none)'}`);
    return { urls, token };
  } catch (error) {
    console.error('Error reading args.txt:', error.message);
    return { urls: [], token: null };
  }
}

async function downloadAndProcess(url, token, downloadDir, markdownOutputDir, repoName) {
  try {
    // ダウンロードと解凍処理
    console.log(`\n[${url}] の処理を開始します...`);
    console.log('ダウンロードを開始します...');

    if (!url) {
        throw new Error('URL is missing.');
    }

    const config = { responseType: 'arraybuffer', headers: {} };
    if (token) config.headers['PRIVATE-TOKEN'] = token;
    const res = await axios.get(url, config);
    console.log(`ダウンロード完了 (${res.data.length} bytes)`);

    console.log('解凍中...');
    const zip = new AdmZip(res.data);
    fs.mkdirSync(downloadDir, { recursive: true }); // 解凍前にディレクトリを作成
    zip.extractAllTo(downloadDir, true);
    console.log(`解凍完了: ${path.resolve(downloadDir)}`);

    // 4. 結合Markdownファイルの生成
    const combinedFilePath = generateMarkdown(downloadDir, markdownOutputDir);

    // 5. 分割処理の実行
    if (combinedFilePath) {
        splitMarkdownFile(combinedFilePath, markdownOutputDir, repoName);
    }
    console.log(`[${url}] の処理が完了しました。`);
  } catch (error) {
    console.error('\nエラーが発生しました:');
    if (error.response) {
      console.error(`Status: ${error.response.status} - ${error.response.statusText}`);
    } else {
      console.error(error.message);
    }
  }
}

/**
 * --- 設定: 出力ディレクトリ ---
 */
const BASE_MARKDOWN_OUTPUT_DIR = 'markdown_outputs';

/**
 * 【パッケージインストール】npm install axios adm-zip prompts
 */
async function main() {
  const args = await readArgsFromFile('args.txt');

  if (args.urls.length === 0) {
    console.log('処理対象のURLがargs.txtに見つかりませんでした。');
    return;
  }

  console.log('\n--- 実行内容 ---');
  args.urls.forEach((url, index) => {
    console.log(`  [${index + 1}] ${url}`);
  });

  const confirm = await prompts({ type: 'confirm', name: 'value', message: '上記内容で実行しますか？', initial: true });
  if (!confirm.value) { console.log('キャンセルしました。'); return; }

  // --- 前回の成果物ディレクトリをクリーンアップ ---
  console.log('\n前回の成果物ディレクトリをクリーンアップします...');
  try {
    if (fs.existsSync(BASE_DOWNLOAD_DIR)) {
      fs.rmSync(BASE_DOWNLOAD_DIR, { recursive: true, force: true });
      console.log(`  - ${BASE_DOWNLOAD_DIR} を削除しました。`);
    }
    if (fs.existsSync(BASE_MARKDOWN_OUTPUT_DIR)) {
      fs.rmSync(BASE_MARKDOWN_OUTPUT_DIR, { recursive: true, force: true });
      console.log(`  - ${BASE_MARKDOWN_OUTPUT_DIR} を削除しました。`);
    }
  } catch (error) {
    console.error(`クリーンアップ中にエラーが発生しました: ${error.message}`);
  }

  for (let i = 0; i < args.urls.length; i++) {
    const url = args.urls[i];
    // URLからリポジトリ名を推測（簡易版）
    const repoName = path.basename(url, '.zip').replace(/[^a-zA-Z0-9]/g, '_') || `repo_${i + 1}`;

    // URLごとにユニークなディレクトリパスを生成
    const downloadDir = path.join(BASE_DOWNLOAD_DIR, repoName);
    const markdownOutputDir = path.join(BASE_MARKDOWN_OUTPUT_DIR, repoName);

    await downloadAndProcess(url, args.token, downloadDir, markdownOutputDir, repoName);
  }

  console.log('\nすべての処理が完了しました。');
}

main();