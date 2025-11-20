# CineView AI

[English](#english) | [中文](#chinese)

<a name="english"></a>

## Introduction

https://www.youtube.com/watch?v=k6EtLYL9Zrc

CineView AI is an advanced automated video breakdown tool powered by Google Gemini 2.5 Multimodal API. It transforms raw video files into professional creative assets in minutes.

Designed for filmmakers, editors, and content creators, CineView AI extracts ultra-dense frame sequences from video files to reconstruct scenes, detect cuts, and generate detailed production documents. It runs entirely in the browser (client-side), ensuring your video files are processed locally and never uploaded to a server (only frames are sent to the API for analysis).

![](capture/home.png)
## Key Features
![](capture/1.png)
![](capture/2.png)
- Automated Shot List: Generates frame-accurate spotting sheets including Start/End time, Duration, Shot Size, Camera Movement, and Description.
![](capture/3.png)
![](capture/4.png)
- Color Script Generation: Visualizes the emotional arc of your video by extracting and displaying dominant color palettes for every shot.
![](capture/5.png)
- Reverse Screenplay: Automatically reverse-engineers a standard industry-format screenplay from the visual action and audio cues in the video.
![](capture/6.png)
- AI Poster Generator: Uses Gemini Vision to identify the main character and scene context, generating high-quality cinematic posters.
- Bilingual Support: Fully supports English and Chinese (Simplified) interfaces and analysis output.
- Privacy First: Video processing happens locally. API Keys are stored in your browser LocalStorage.

## Tech Stack

- Frontend: React 19, TypeScript, Vite
- Styling: Tailwind CSS
- AI Integration: Google GenAI SDK (@google/genai)
- Models Used: Gemini 2.5 Flash (Analysis), Gemini 2.5 Flash Image (Poster Generation)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Google Gemini API Key

To get an API key, visit Google AI Studio.

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/cineview-ai.git
cd cineview-ai
```

2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npm run dev
```

4. Open your browser and navigate to the local host address shown in your terminal (usually http://localhost:5173).

## Usage Guide

1. Enter API Key: Upon launching, click the key icon or follow the prompt to enter your Google Gemini API Key. The key is saved locally on your device.
2. Upload Video: Drag and drop a video file (MP4, MOV, WebM).
   - Recommendation: Short clips (under 2 minutes) work best for detailed analysis.
3. Analyze: The app will extract frames and send them to Gemini for analysis.
4. Explore Results:
   - Shot List: View, edit, and export your shots to CSV.
   - Color Script: Analyze the color palette and export visual summaries.
   - Screenplay: Read the AI-generated script derived from your video.
   - Poster: Generate creative movie posters based on the footage.

---

<a name="chinese"></a>

# CineView AI (中文介绍)

## 项目介绍

CineView AI 是一款基于 Google Gemini 2.5 多模态大模型的自动化视频分析工具。它能够将原始视频文件在几分钟内转化为专业的影视制作资产。

该项目专为电影制作人、剪辑师和内容创作者设计。通过提取视频中的高密度关键帧，CineView AI 能够重建场景、识别剪辑点，并生成详细的制作文档。项目完全在浏览器端运行（客户端），确保您的视频文件仅在本地处理，不会被上传到任何服务器（仅发送截图帧给 API 用于分析）。

## 核心功能

- 自动分镜表 (Shot List): 生成精确到帧的场记表，包含开始/结束时间、时长、景别、运镜方式和画面描述。
- 色彩脚本 (Color Script): 提取每个镜头的核心色调，可视化呈现视频的情绪弧光。
- 反推剧本: 根据视频中的视觉动作和音频线索，自动反向生成标准格式的电影剧本。
- AI 海报生成: 利用 Gemini 视觉能力识别主角和场景语境，生成高质量的电影海报。
- 双语支持: 完美支持英文和简体中文界面及分析结果输出。
- 隐私优先: 视频处理完全在本地进行。API Key 仅存储在您的浏览器 LocalStorage 中。

## 技术栈

- 前端框架: React 19, TypeScript, Vite
- 样式库: Tailwind CSS
- AI 集成: Google GenAI SDK (@google/genai)
- 使用模型: Gemini 2.5 Flash (视频分析), Gemini 2.5 Flash Image (海报生成)

## 快速开始

### 前置要求

- Node.js (v18 或更高版本)
- Google Gemini API Key

您可以前往 Google AI Studio 免费获取 API Key。

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/yourusername/cineview-ai.git
cd cineview-ai
```

2. 安装依赖

```bash
npm install
```

3. 启动开发服务器

```bash
npm run dev
```

4. 打开浏览器访问终端中显示的本地地址（通常是 http://localhost:5173）。

## 使用指南

1. 输入 API Key: 首次启动时，点击右上角的钥匙图标或根据提示输入您的 Google Gemini API Key。密钥将安全地保存在您的本地。
2. 上传视频: 拖拽或点击上传视频文件 (支持 MP4, MOV, WebM)。
   - 建议: 为了获得最佳的详细分析效果，建议上传 2 分钟以内的短片。
3. 等待分析: 应用会自动提取关键帧并发送给 Gemini 进行多模态分析。
4. 查看结果:
   - 分镜表: 查看、编辑并将分镜数据导出为 CSV 文件。
   - 色彩脚本: 分析色彩分布并导出长图。
   - 剧本: 查看由 AI 根据视频内容反推生成的剧本。
   - 海报: 基于视频画面一键生成电影海报。

---

## 贡献者 Eddy & Hulk
## 联系我们 eddyse@gmail.com

## License

[MIT](LICENSE)