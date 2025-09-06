# IconifyCraft 开发指南

欢迎参与 IconifyCraft 项目的开发！本指南将帮助您了解项目架构、开发规范和贡献流程。

## 目录

- [项目概述](#项目概述)
- [项目架构](#项目架构)
- [开发环境搭建](#开发环境搭建)
- [开发规范](#开发规范)
- [代码风格](#代码风格)
- [提交规范](#提交规范)
- [脚本使用指南](#脚本使用指南)
- [项目结构](#项目结构)
- [核心功能模块](#核心功能模块)
- [贡献指南](#贡献指南)

---

## 项目概述

IconifyCraft 是一个用于生成 Minecraft 资源包的 Web 应用程序，可以将物品/方块材质转换为聊天图标。项目基于 Vitesse 模板构建，使用 Vue 3 + Vite 技术栈。

### 核心功能

- 📦 解析 Minecraft 资源包 ZIP 文件
- 🎨 生成材质图集（Atlas）和位图字体
- 🔤 Unicode 字符映射（从 U+E000 开始）
- 📤 导出完整的 Minecraft 资源包
- 🌐 多语言支持（中文/英文）
- 💾 项目实例管理和持久化存储

---

## 项目架构

### 技术栈

```
├── Vue 3 (Composition API)     # 前端框架
├── TypeScript                  # 类型安全
├── Vite                       # 构建工具
├── UnoCSS                     # 原子化CSS
├── Vue Router                 # 路由管理
├── Vue I18n                   # 国际化
├── Pinia                      # 状态管理
├── Dexie                      # IndexedDB 封装
├── JSZip                      # ZIP 文件处理
└── Canvas API                 # 图像处理
```

### 架构设计原则

- **单一职责**：每个模块专注于特定功能
- **依赖注入**：通过 Composition API 实现松耦合
- **响应式设计**：充分利用 Vue 3 响应式系统
- **类型安全**：全面使用 TypeScript 类型检查
- **模块化**：业务逻辑与 UI 组件分离

---

## 开发环境搭建

### 系统要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装步骤

```bash
# 克隆项目
git clone <repository-url>
cd iconifycraft

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 开发服务器

```bash
pnpm dev          # 启动开发服务器 (端口 3333)
```

访问 `http://localhost:3333` 查看应用程序。

---

## 开发规范

### 文件命名规范

```
├── 组件文件: PascalCase (UserProfile.vue)
├── 页面文件: kebab-case (user-profile.vue)
├── 工具文件: camelCase (textureUtils.ts)
├── 类型文件: PascalCase (AtlasTypes.ts)
├── 常量文件: UPPER_CASE (CONFIG.ts)
```

## 代码风格

项目使用 [@antfu/eslint-config](https://github.com/antfu/eslint-config) 进行代码规范约束。

### 主要规则

- **单引号**：使用单引号代替双引号
- **无分号**：行末不使用分号
- **2 空格缩进**：统一使用 2 空格缩进
- **尾逗号**：多行对象/数组使用尾逗号

---

## 提交规范

项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

### 提交类型

```
feat:     新功能
fix:      Bug 修复
docs:     文档更新
style:    代码格式化（不影响功能）
refactor: 重构代码
perf:     性能优化
test:     测试相关
chore:    构建工具、依赖更新等
```

### 提交格式

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### 提交示例

```bash
# 新功能
git commit -m "feat(atlas): add multi-atlas generation support"

# Bug 修复
git commit -m "fix(export): resolve font file encoding issue"

# 文档更新
git commit -m "docs: update development guide"

# 重构
git commit -m "refactor(utils): optimize texture processing pipeline"
```

---

## 脚本使用指南

### 开发脚本

```bash
# 开发服务器
pnpm dev                    # 启动开发服务器

# 构建相关
pnpm build                  # 构建生产版本
pnpm preview               # 预览构建结果

# 代码质量
pnpm lint                  # ESLint 检查和自动修复
pnpm typecheck            # TypeScript 类型检查

# 测试
pnpm test                  # 运行单元测试
pnpm test:unit            # 运行单元测试（别名）

# 工具脚本
pnpm check-translations   # 检查翻译覆盖率
pnpm sizecheck           # 分析构建包大小
pnpm up                  # 更新依赖包
```

### 翻译检查脚本

```bash
pnpm check-translations
```

**功能**：

- 检查 Minecraft 材质翻译覆盖率
- 生成翻译缺失报告
- 提供映射表添加建议
- 输出详细的 Markdown 报告

**输出文件**：

- `translation-check-report.md` - 详细翻译检查报告

---

## 项目结构

```
src/
├── components/           # Vue 组件
│   ├── base/            # 基础 UI 组件
│   ├── atlas/           # 图集相关组件
│   ├── export/          # 导出功能组件
│   ├── resource-pack/   # 资源包管理组件
│   ├── settings/        # 设置页面组件
│   ├── instance/        # 实例管理组件
│   └── layout/          # 布局组件
├── composables/         # 组合式函数
│   ├── useAtlasGenerator.ts    # 图集生成
│   ├── useResourcePack.ts      # 资源包管理
│   ├── useIconExport.ts        # 导出功能
│   └── useInstanceManager.ts   # 实例管理
├── services/            # 业务服务
│   ├── core/           # 核心服务
│   ├── database/       # 数据库服务
│   └── generators/     # 文件生成器
├── stores/             # Pinia 状态管理
├── types/              # TypeScript 类型定义
├── utils/              # 工具函数
├── data/               # 静态数据
├── styles/             # 样式文件
└── pages/              # 页面文件
```

---

## 核心功能模块

### 1. 图集生成模块

**核心文件**：`src/composables/useAtlasGenerator.ts`

**主要功能**：

- 处理上传的资源包材质
- 生成材质图集布局
- 创建 Unicode 字符映射
- 支持多图集生成（>256 材质时）

**关键流程**：

```
材质解析 → 布局计算 → Canvas 渲染 → Unicode 分配 → 图集生成
```

### 2. 资源包处理模块

**核心文件**：`src/composables/useResourcePack.ts`

**主要功能**：

- ZIP 文件解析和验证
- 材质继承和覆盖处理
- 版本兼容性检查
- 拖拽上传支持

### 3. 导出系统

**核心文件**：`src/services/core/ExportService.ts`

**主要功能**：

- 生成完整的 Minecraft 资源包
- 创建位图字体 JSON 文件
- 处理多图集场景
- 生成 `pack.mcmeta` 元数据

### 4. 实例管理系统

**核心文件**：`src/services/InstanceStorageService.ts`

**主要功能**：

- 项目持久化存储（IndexedDB）
- 自动保存功能
- 项目版本管理
- 统计数据跟踪

---

## 贡献指南

### 贡献流程

1. **Fork 项目**

   ```bash
   # 在 GitHub 上 Fork 项目到您的账户
   ```

2. **创建特性分支**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **开发和测试**

   ```bash
   # 进行开发
   pnpm dev

   # 运行测试
   pnpm test

   # 检查代码风格
   pnpm lint

   # 类型检查
   pnpm typecheck
   ```

4. **提交代码**

   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **推送分支**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **创建 Pull Request**
   - 在 GitHub 上创建 Pull Request
   - 填写详细的变更说明
   - 确保通过所有自动化检查

### 代码审查检查清单

提交前请确保：

- ✅ 代码通过 `pnpm lint` 检查
- ✅ 类型检查通过 `pnpm typecheck`
- ✅ 测试全部通过 `pnpm test`
- ✅ 新功能有对应的类型定义
- ✅ 重要功能有单元测试覆盖
- ✅ 提交信息符合规范
- ✅ 代码有适当的注释和文档

### 问题反馈

如果您发现 bug 或有功能建议，请：

1. 检查是否已有相关 Issue
2. 使用 Issue 模板创建新的问题
3. 提供详细的重现步骤和环境信息
4. 如可能，提供最小重现示例

---

## 常见问题

### Q: 如何扩展支持的 Minecraft 版本？

A: 更新 `src/types/minecraft.ts` 中的版本定义，并在相应服务中添加版本兼容性逻辑。
