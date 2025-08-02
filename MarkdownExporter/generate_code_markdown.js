const fs = require('fs');
const path = require('path');

// --- 設定 ---
const TARGET_DIR = process.argv[2] || '.';
const OUTPUT_DIR = 'markdown_outputs'; // 出力先ディレクトリ

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
  'generate_code_markdown.js', 'README.md'
]);

const LANGUAGE_MAP = {
  'js': 'javascript', 'jsx': 'javascript',
  'ts': 'typescript', 'tsx': 'typescript',
  'py': 'python',
  'java': 'java',
  'c': 'c', 'cpp': 'cpp', 'h': 'c', 'hpp': 'cpp',
  'html': 'html',
  'css': 'css', 'scss': 'scss', 'less': 'less',
  'json': 'json',
  'xml': 'xml',
  'yaml': 'yaml', 'yml': 'yaml',
  'md': 'markdown',
  'php': 'php',
  'go': 'go',
  'rb': 'ruby',
  'swift': 'swift',
  'kt': 'kotlin',
  'rs': 'rust',
  'vue': 'vue',
  'svelte': 'svelte',
  'sh': 'bash',
  'txt': 'text',
  'sql': 'sql',
  'graphql': 'graphql',
  'conf': 'text', 'config': 'text', 'ini': 'ini', 'env': 'bash', 'toml': 'toml',
  'gitignore': 'text', 'gitattributes': 'text', 'npmrc': 'text', 'yarnrc': 'text'
};

/**
 * 指定ディレクトリ配下の各フォルダのファイルを収集し、単一のMarkdownファイルにまとめる
 * @param {string} currentPath 現在の探索パス（絶対パス）
 * @param {string} relativePath ルートディレクトリからの相対パス
 * @param {string} rootDir ルートディレクトリの絶対パス
 */
function collectFilesAndOutputMarkdown(currentPath, relativePath, rootDir) {
  let fileContents = '';
  let subfolders = [];
  let hasFiles = false;

  try {
    const files = fs.readdirSync(currentPath);

    // ファイルを先に処理
    files.forEach(file => {
      const fullPath = path.join(currentPath, file);
      const currentRelativePath = path.join(relativePath, file);
      const stats = fs.statSync(fullPath);

      if (stats.isFile()) {
        const fileName = path.basename(file);
        const fileExtension = path.extname(file).slice(1).toLowerCase();

        if (fileName.startsWith('.') && !SOURCE_EXTENSIONS.has(fileExtension) && !EXCLUDE_FILES.has(fileName)) {
          return;
        }
        if (EXCLUDE_FILES.has(fileName)) {
          return;
        }
        if (SOURCE_EXTENSIONS.has(fileExtension)) {
          try {
            const fileContent = fs.readFileSync(fullPath, 'utf8');
            const langName = LANGUAGE_MAP[fileExtension] || '';
            fileContents += `---\n\n`;
            fileContents += `### ファイル: ${currentRelativePath.replace(/\\/g, '/')}\n\n`;
            fileContents += `\`\`\`${langName}\n`;
            fileContents += fileContent.trim() + '\n';
            fileContents += `\`\`\`\n\n`;
            hasFiles = true;
          } catch (readError) {
            fileContents += `---<br>\n`;
            fileContents += `### ファイル: \`${currentRelativePath.replace(/\\/g, '/')}\`\n\n`;
            fileContents += `**エラー: このファイルを読み取れませんでした。** (${readError.message})\n\n`;
          }
        }
      }
    });

    // フォルダ内にファイルがあればMarkdownファイルとして出力
    if (hasFiles) {
      // ルートディレクトリからの相対パスを'/'で結合し、'.'を'_'に置換してファイル名にする
      const baseDirName = path.basename(rootDir);
      let outputFileName = path.join(relativePath, 'temp').replace(/\\/g, '/').replace(/\//g, '_');
      // ルートディレクトリ名と、そこからのパスを連結
      outputFileName = baseDirName + '_' + outputFileName.replace('_temp', '.md').replace('_' + baseDirName + '_', '_');
      
      const outputFile = path.join(OUTPUT_DIR, outputFileName);
      let md = `# ディレクトリ: ${relativePath.replace(/\\/g, '/')}\n\n`;
      md += fileContents;
      fs.writeFileSync(outputFile, md, 'utf8');
      console.log(`出力: ${outputFile}`);
    }

    // サブディレクトリを探索
    files.forEach(file => {
      const fullPath = path.join(currentPath, file);
      const currentRelativePath = path.join(relativePath, file);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        const dirName = path.basename(fullPath);
        if (!EXCLUDE_DIRS.has(dirName)) {
          subfolders.push({ fullPath, currentRelativePath });
        }
      }
    });

    // サブフォルダも再帰的に処理
    subfolders.forEach(sub => {
      collectFilesAndOutputMarkdown(sub.fullPath, sub.currentRelativePath, rootDir);
    });

  } catch (dirReadError) {
    console.error(`エラー: ディレクトリ '${currentPath}' の読み取り中に問題が発生しました: ${dirReadError.message}`);
  }
}

// --- メイン処理 ---
function main() {
  const absoluteTargetPath = path.resolve(TARGET_DIR);
  const rootDirName = path.basename(absoluteTargetPath);

  console.log(`指定されたディレクトリ: ${absoluteTargetPath}`);
  console.log(`出力ディレクトリ: ${OUTPUT_DIR}`);
  console.log(`フォルダごとに「ルートからのパス.md」としてMarkdownファイルを出力します...`);

  if (!fs.existsSync(absoluteTargetPath)) {
    console.error(`エラー: 指定されたディレクトリが存在しません: ${absoluteTargetPath}`);
    process.exit(1);
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  collectFilesAndOutputMarkdown(absoluteTargetPath, rootDirName, absoluteTargetPath);
  console.log(`\n完了しました！各フォルダの内容が1つのディレクトリにMarkdownファイルとして出力されました。`);
}

main();