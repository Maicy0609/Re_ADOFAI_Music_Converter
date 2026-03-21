# Re: ADOFAI Music Converter

[English Documentation](./README.md)

一个基于网页的《**冰与火之舞 (A Dance of Fire and Ice)**》谱面转换工具。这是对原版 [Python 版本](https://github.com/Luxusio/ADOFAI-Midi-Converter)的完整重写，使用纯前端技术实现。

## 功能特点

- **双输入支持**：MIDI 文件和 WAV 音频文件
- **两种转换模式**：
  - **angleData 模式**：纯角度控制，固定基准 BPM
  - **Zipper 模式**：固定角度，动态 BPM (angleData + SetSpeed)
- **多语言支持**：英文和简体中文
- **纯前端运行**：无需后端服务器，可部署到任何静态文件托管服务

## 技术栈

- **框架**：Next.js 16 + React 19 + TypeScript
- **样式**：Tailwind CSS 4 + shadcn/ui
- **状态管理**：Zustand
- **动画**：Framer Motion
- **音频处理**：Web Audio API

## 快速开始

### 方式一：使用预编译静态文件

从 [Releases](https://github.com/Maicy0609/Re_ADOFAI_Music_Converter/releases) 下载 `ADOFAI_Converter_Web_Static.zip`，解压后部署到任何静态文件托管服务：

```bash
# 本地预览
npx serve .
```

### 方式二：从源码构建

```bash
# 克隆仓库
git clone https://github.com/Maicy0609/Re_ADOFAI_Music_Converter.git
cd Re_ADOFAI_Music_Converter

# 安装依赖
bun install

# 开发模式
bun run dev

# 构建静态文件
bun run build
```

## 使用说明

1. **上传文件**：拖放或点击上传 MIDI (.mid) 或 WAV 音频文件
2. **选择模式**：选择 angleData 或 Zipper 模式
3. **调整参数**：
   - MIDI：选择要启用的轨道，设置八度偏移
   - 音频：选择采样模式，设置阈值范围
4. **转换并下载**：点击转换按钮，完成后下载 .adofai 文件

## 核心算法

### 时间公式

```
时间 = 旋转角度 / 180 × 60 / BPM
```

两种模式生成的拍子绝对时间完全相同：
- **angleData 模式**：固定 BPM → 动态角度 = 时间 × BPM × 180 / 60
- **Zipper 模式**：固定角度 → 动态 BPM = 角度 / 180 × 60 / 时间

### MIDI 解析

从 MIDI 文件中提取音符事件，根据音符频率计算时间间隔。

### 音频节拍检测

使用能量信号峰值检测算法识别节拍位置：
1. 计算能量信号 (样本²)
2. 峰值检测 (find_peaks)
3. 转换为时间点

### 魔法数字

Zipper 模式中：
```
魔法数字 = 180 / 夹角
显示 BPM = 实际 BPM / 魔法数字
```

示例：15° 夹角 → 魔法数字 = 12

## 项目结构

```
src/
├── app/
│   ├── page.tsx          # 主页面
│   └── layout.tsx        # 布局
├── lib/
│   ├── core/
│   │   ├── types.ts      # 类型定义
│   │   ├── midi-parser.ts    # MIDI 文件解析器
│   │   ├── audio-processor.ts # 音频加载器
│   │   ├── beat-detector.ts  # 节拍检测
│   │   └── map-data.ts   # ADOFAI 谱面生成器
│   ├── i18n/             # 国际化
│   └── store.ts          # 状态管理
└── components/ui/        # UI 组件 (shadcn/ui)
```

## 致谢

- 原版 Java 开发者：[Luxus io](https://github.com/Luxusio/ADOFAI-Midi-Converter)
- [pyadofai](https://github.com/TonyLimps/pyadofai) - angleData 计算参考
- [apofai](https://github.com/sky-sama/apofai_main_console) - 音频节拍检测参考

## 许可证

开源项目。请参考原 Python 项目了解许可条款。
