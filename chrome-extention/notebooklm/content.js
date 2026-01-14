// --- 設定・ステート管理 ---
const STORAGE_KEY = 'nfm_data';

// データ構造を拡張: scope (global/notebookId) で分ける
// {
//   global: { folders: [], mapping: {} }, // ノートブック一覧用
//   notebooks: {
//     "notebookId_123": { folders: [], mapping: {} } // 各ノートブック内のリソース用
//   }
// }
let appData = {
  global: { folders: [{id:'f1', name:'仕事用'}], mapping: {} },
  notebooks: {}
};

let currentNotebookId = null; // nullなら一覧画面、IDが入れば詳細画面

// --- 初期化処理 ---
async function init() {
  console.log('NotebookLM Folder Manager: Started');
  
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  if (stored[STORAGE_KEY]) {
    appData = stored[STORAGE_KEY];
  }

  injectSidebar();

  // URL変更検知とDOM監視を兼ねたループ
  const observer = new MutationObserver(debounce(handlePageChange, 1000));
  observer.observe(document.body, { childList: true, subtree: true });
  
  // 初回実行
  handlePageChange();
}

// --- メインロジック ---

function handlePageChange() {
  // 現在のURLからモードを判定
  const path = window.location.pathname;
  const match = path.match(/\/notebook\/([^\/]+)/);

  if (match) {
    // 詳細画面 (リソースモード)
    currentNotebookId = match[1];
    updateHeaderTitle('Resources');
    scanResources();
  } else {
    // 一覧画面 (ノートブックモード)
    currentNotebookId = null;
    updateHeaderTitle('My Notebooks');
    scanNotebooks();
  }
}

// --- スクレイピング処理 ---

// 1. ノートブック一覧の取得 (前回と同じ)
function scanNotebooks() {
  if (currentNotebookId) return; // 誤爆防止

  const links = Array.from(document.querySelectorAll('a[href^="/notebook/"]'));
  const items = {};
  
  links.forEach(link => {
    const id = link.getAttribute('href').split('/').pop();
    const title = link.textContent.trim() || "名称未設定";
    if (link.closest('#nfm-sidebar')) return;
    if (id && title) items[id] = { id, title, href: link.href };
  });

  renderTree(items, 'global');
}

// 2. リソース(ソース)一覧の取得 【aria-label版】
// 2. リソース(ソース)一覧の取得 【aria-label版】
function scanResources() {
  if (!currentNotebookId) return;

  // ユーザー情報に基づき、クラス名でチェックボックスを特定
  const checkboxes = document.querySelectorAll('input.mdc-checkbox__native-control');
  
  const items = {};
  
  checkboxes.forEach((cb) => {
    // 拡張機能サイドバー内の要素は無視
    if (cb.closest('#nfm-sidebar')) return;

    // input要素の aria-label 属性から直接タイトルを取得
    const title = cb.getAttribute('aria-label');

    // 除外ワード（「すべて選択」などのシステム用チェックボックスを除外）
    const ignoreLabels = ["すべて選択", "Select all", "ソース", "Sources", null, ""];

    if (!ignoreLabels.includes(title)) {
      // ID生成 (タイトルベース)
      // タイトルが変わらない限り同じIDになるようにする
      const id = 'src_' + btoa(unescape(encodeURIComponent(title))).substring(0, 15);
      
      items[id] = { id, title: title, href: '#' };
    }
  });

  renderTree(items, 'notebooks');
}


// --- UI描画 ---

function injectSidebar() {
  if (document.getElementById('nfm-sidebar')) return;

  const sidebar = document.createElement('div');
  sidebar.id = 'nfm-sidebar';
  sidebar.innerHTML = `
    <div class="nfm-header">
      <div id="nfm-view-title" class="nfm-title">Loading...</div>
      <button id="nfm-add-folder" style="cursor:pointer;">＋Folder</button>
    </div>
    <div id="nfm-folder-container"></div>
    <div class="nfm-uncategorized">
      <div class="nfm-title" style="font-size:12px; color:#5f6368;">未分類</div>
      <ul id="nfm-uncategorized-list" class="nfm-list"></ul>
    </div>
  `;
  document.body.appendChild(sidebar);

  document.getElementById('nfm-add-folder').addEventListener('click', createNewFolder);
}

function updateHeaderTitle(text) {
  const el = document.getElementById('nfm-view-title');
  if (el) el.textContent = text;
}

// targetKey: 'global' または 'notebooks'
function renderTree(scrapedItems, targetType) {
  const folderContainer = document.getElementById('nfm-folder-container');
  const uncatList = document.getElementById('nfm-uncategorized-list');
  if (!folderContainer) return;

  folderContainer.innerHTML = '';
  uncatList.innerHTML = '';

  // 現在のコンテキストに応じたデータを取得
  let currentData;
  if (targetType === 'global') {
    currentData = appData.global;
  } else {
    // ノートブックごとのデータがなければ初期化
    if (!appData.notebooks[currentNotebookId]) {
      appData.notebooks[currentNotebookId] = { folders: [], mapping: {} };
    }
    currentData = appData.notebooks[currentNotebookId];
  }

  // 1. フォルダ描画
  currentData.folders.forEach(folder => {
    const folderDiv = document.createElement('div');
    folderDiv.className = 'nfm-folder';
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'nfm-folder-title';
    titleDiv.textContent = folder.name;
    folderDiv.appendChild(titleDiv);

    const listUl = document.createElement('ul');
    listUl.className = 'nfm-list';
    
    const itemIds = Object.keys(currentData.mapping).filter(id => currentData.mapping[id] === folder.id);
    
    itemIds.forEach(itemId => {
      const info = scrapedItems[itemId] || { title: itemId + '(不明)', href: '#' };
      listUl.appendChild(createItemElement(itemId, info.title, info.href, targetType));
      delete scrapedItems[itemId]; 
    });

    folderDiv.appendChild(listUl);
    folderContainer.appendChild(folderDiv);
  });

  // 2. 未分類描画
  Object.values(scrapedItems).forEach(item => {
    uncatList.appendChild(createItemElement(item.id, item.title, item.href, targetType));
  });
}


function createItemElement(id, title, href, targetType) {
  const li = document.createElement('li');
  li.className = 'nfm-item';
  
  const a = document.createElement('a');
  a.href = href;
  a.textContent = title;
  
  if (targetType === 'notebooks') {
    a.onclick = (e) => e.preventDefault();
  }
  
  li.appendChild(a);

  // 右クリックで独自のメニューを表示
  li.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showContextMenu(e, id, targetType);
  });

  return li;
}


// --- データ操作 ---

async function createNewFolder() {
  const name = prompt("新しいフォルダ名:");
  if (!name) return;

  const newFolder = { id: 'f' + Date.now(), name: name };

  if (currentNotebookId) {
    // 現在のノートブック内リソース用のフォルダを作成
    if (!appData.notebooks[currentNotebookId]) {
      appData.notebooks[currentNotebookId] = { folders: [], mapping: {} };
    }
    appData.notebooks[currentNotebookId].folders.push(newFolder);
  } else {
    // グローバル（ノートブック一覧用）フォルダを作成
    appData.global.folders.push(newFolder);
  }

  await saveData();
  handlePageChange(); // 再描画
}

async function moveItemToFolder(itemId, targetType) {
  let contextData;
  if (targetType === 'global') {
    contextData = appData.global;
  } else {
    contextData = appData.notebooks[currentNotebookId];
  }

  // 簡易的に最初のフォルダへ移動させるロジック（UIは後でリッチにする）
  if (contextData.folders.length === 0) {
    alert("まずはフォルダを作成してください");
    return;
  }

  const targetFolder = contextData.folders[0]; // とりあえず先頭のフォルダ
  if(confirm(`「${targetFolder.name}」フォルダに移動しますか？`)) {
    contextData.mapping[itemId] = targetFolder.id;
    await saveData();
    handlePageChange();
  }
}

async function saveData() {
  await chrome.storage.local.set({ [STORAGE_KEY]: appData });
}

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// --- コンテキストメニュー制御 ---

function showContextMenu(e, itemId, targetType) {
  // 既存のメニューがあれば消す
  closeContextMenu();

  // 現在のコンテキスト（一覧 or 詳細）に応じたフォルダリストを取得
  let contextData;
  if (targetType === 'global') {
    contextData = appData.global;
  } else {
    contextData = appData.notebooks[currentNotebookId];
  }

  // メニュー要素を作成
  const menu = document.createElement('div');
  menu.className = 'nfm-context-menu';
  
  // 表示位置の設定 (マウス位置)
  menu.style.top = `${e.clientY}px`;
  menu.style.left = `${e.clientX}px`;

  // ヘッダー
  const header = document.createElement('div');
  header.className = 'nfm-menu-header';
  header.textContent = 'フォルダへ移動...';
  menu.appendChild(header);

  // フォルダ一覧をメニュー項目として追加
  if (contextData.folders.length === 0) {
    const emptyItem = document.createElement('div');
    emptyItem.className = 'nfm-menu-item';
    emptyItem.textContent = '(フォルダがありません)';
    menu.appendChild(emptyItem);
  } else {
    contextData.folders.forEach(folder => {
      const item = document.createElement('div');
      item.className = 'nfm-menu-item';
      item.textContent = `📁 ${folder.name}`;
      item.onclick = async () => {
        // 移動処理
        contextData.mapping[itemId] = folder.id;
        await saveData();
        handlePageChange(); // 再描画
        closeContextMenu();
      };
      menu.appendChild(item);
    });
  }
  
  // 「未分類に戻す」オプション
  const removeItem = document.createElement('div');
  removeItem.className = 'nfm-menu-item';
  removeItem.style.borderTop = '1px solid #eee';
  removeItem.style.color = '#d93025';
  removeItem.textContent = '未分類に戻す';
  removeItem.onclick = async () => {
    delete contextData.mapping[itemId];
    await saveData();
    handlePageChange();
    closeContextMenu();
  };
  menu.appendChild(removeItem);

  document.body.appendChild(menu);

  // メニュー外をクリックしたら閉じるイベントを登録
  setTimeout(() => {
    document.addEventListener('click', closeContextMenu, { once: true });
  }, 0);
}

function closeContextMenu() {
  const existing = document.querySelector('.nfm-context-menu');
  if (existing) existing.remove();
}

init();