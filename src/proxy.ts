/*
 * @Description: 代理服务器
 * @Author: wind-lc
 * @version: 1.0
 * @Date: 2021-12-21 17:33:38
 * @LastEditTime: 2022-04-28 16:21:38
 * @FilePath: \proxy\src\proxy.ts
 */
const Koa = require('koa');
try { require('util')._extend = Object.assign } catch {}
const { createProxyMiddleware } = require('http-proxy-middleware');
const k2c = require('koa2-connect');
const path = require('path');
const koaStatic = require('koa-static');
import { IProxyServer } from './interface';

export default function (port: number, target: string, exportLog: Function): Promise<IProxyServer> {
  const app = new Koa();
  return new Promise((resolve, reject) => {
    app
      // 先尝试命中静态资源，其余请求交给代理
      .use(koaStatic(path.join(__dirname, 'html')))
      .use(async (ctx: any, next: () => any) => {
        await k2c(
          createProxyMiddleware({
            target: target,
            changeOrigin: true
          })
        )(ctx, next);
        const log = ctx;
        log.target = target;
        exportLog(log);
        // 代理已处理请求，不再向后续中间件传递，避免读取已被占用的请求流
        return;
      });
    const proxy = app.listen(port, () => {
      console.log(`端口${port}代理服务器正在运行`);
      resolve({ proxy, info: `端口${port}代理服务器正在运行` });
    }).on('error', (error: Error) => {
      console.log(error);
      console.log('关闭失败');
      if (error.message.includes('address already in use')) {
        console.log(`错误信息：创建失败端口${port}已被占用`);
        reject(`端口${port}已被占用`);
      } else {
        console.log(`错误信息：创建失败${error.message}`);
        reject(`创建失败${error.message}`);
      }
    });
  });
}
