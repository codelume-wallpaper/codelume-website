# 码镜 Codelume 网站

码镜是 macOS 动态壁纸应用。本仓库包含产品网站、Mac 安装包下载页、帮助中心，以及由应用内购买流程打开的 Paddle 结账页。网站使用 React、TypeScript 和 Vite，部署在 Cloudflare Pages。

[访问官网](https://codelume.cn/) · [下载 Mac 版](https://codelume.cn/download) · [帮助中心](https://codelume.cn/help)

## 本地开发

建议使用 Node.js 22，包管理器版本为 pnpm 10.24.0。在仓库根目录安装依赖并启动开发服务器。

```sh
pnpm install --frozen-lockfile
pnpm dev --mode production
```

打开 [本地网站](http://localhost:8080)。这个命令启动支持热更新的 Vite 开发服务器。如需预览报价或结账，请将 [.env.example](.env.example) 复制为 `.env.local`，填入网站的正式 Paddle 客户端配置。普通版和 Pro 的说明位于首页定价区，切换语言会刷新对应市场的 Pro 报价。结账页使用应用发起购买时生成的交易 ID。

Vite 可以预览前端。下载列表还依赖 Cloudflare Pages 的 `/api/releases` 和 R2 绑定 `RELEASES`。本地运行 `pnpm test` 可用内存中的测试数据验证版本排序、更新说明和错误处理。

## 检查与构建

```sh
pnpm lint
pnpm exec tsc --noEmit -p tsconfig.app.json
pnpm test
pnpm build
```

生产构建输出到 `dist/`。日常开发使用 `dev` 分支，Cloudflare Pages 从 `main` 部署，Paddle 配置由 Pages 生产构建环境提供。构建输出目录和 R2 绑定见 [wrangler.jsonc](wrangler.jsonc)。定价预览使用的 `VITE_PADDLE_PRO_PRICE_ID` 应与后端结账使用的 `PADDLE_PRICE_ID` 一致。

## 内容维护

| 要修改的内容 | 位置 |
| --- | --- |
| 页面入口与路由 | [src/App.tsx](src/App.tsx) |
| 首页预览、壁纸模式、壁纸类型和定价 | [src/components](src/components/) |
| 九种界面语言的文案 | [src/i18n/locales](src/i18n/locales/) |
| 应用、工坊与壁纸包帮助文档 | [docs](docs/) |
| 条款、隐私和退款政策 | [docs/legal](docs/legal/) |
| Mac 安装包更新说明 | [docs/releases](docs/releases/) |

首页演示视频使用公开 R2 链接，封面图随前端构建。更新视频时先上传新对象，确认公开地址支持播放和拖动进度，再替换组件引用。

### Mac 安装包与更新说明

下载页从公开桶 `codelume-storage-public` 的 `releases/` 读取安装包，按版本号从高到低排列。上传新的正式安装包后，下载页会自动列出该版本。网站版本与 Mac 应用版本分别管理。[下载接口](public/_worker.js)

同一版本的安装包和说明使用相同的文件名，仅扩展名不同。

```text
releases/Codelume-x.y.z.dmg
releases/Codelume-x.y.z.txt
```

TXT 使用 UTF-8，最多为 64 KiB。先写英文默认说明，再用单独一行 `--- translations ---` 分隔译文。各段使用独占一行的语言标签，例如 `[zh]`。缺少对应译文或翻译段格式有误时，页面显示开头的默认说明。完整的九语排版见 [6.1.0 更新说明](docs/releases/Codelume-6.1.0.txt)。
