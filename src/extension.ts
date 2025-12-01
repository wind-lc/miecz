/*
 * @Description: 插件入口
 * @Author: wind-lc
 * @version: 1.0
 * @Date: 2021-12-17 17:55:27
 * @LastEditTime: 2022-06-24 14:45:43
 * @FilePath: \proxy\src\extension.ts
 */
import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';
let sidebarProviderInstance: SidebarProvider | undefined;
export function activate(context: vscode.ExtensionContext) {
	const sidebarProvider = new SidebarProvider(context.extensionUri, context.globalState);
	sidebarProviderInstance = sidebarProvider;
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			"proxy-sidebar",
			sidebarProvider
		)
	);
}
/**
 * 扩展停用时调用，确保关闭所有已创建的代理服务器
 */
export function deactivate() { 
	try {
		sidebarProviderInstance?.shutdownAll();
	} catch {}
}
