/**
 * @file App.js
 * @description モジュールの基本
 * export自体はES6からの機能で、モジュールを分割して管理するために使用されます。
 * exportのキーワードを使うことで外部から参照可能にする。
 */

const APP_TITLE = 'Vue.jsアプリ';

export function getTriangle(base, height) {
  return base * height / 2;
}

export class Article {
  getAppTitle() {
    return APP_TITLE;
  }
}
