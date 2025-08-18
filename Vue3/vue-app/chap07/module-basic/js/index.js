/**
 * @file App.js
 * @description モジュールの基本
 * App.jsのモジュールからimportする
 */
import { Article, getTriangle } from './App.js';

console.log(getTriangle(10, 5));

let a = new Article();
console.log(a.getAppTitle());
