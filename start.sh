#!/bin/bash

# Open Deep Research 启动脚本
# 用于激活虚拟环境并安装项目依赖

set -e  # 遇到错误时退出

echo "🚀 启动 Open Deep Research 项目..."

# 检查虚拟环境是否存在
if [ ! -d ".venv" ]; then
    echo "❌ 虚拟环境不存在，请先创建虚拟环境："
    echo "   uv venv --python 3.11"
    exit 1
fi

# 激活虚拟环境
echo "📦 激活虚拟环境..."
source .venv/bin/activate

# 检查 uv 是否可用
if ! command -v uv &> /dev/null; then
    echo "❌ uv 未安装或不在 PATH 中"
    exit 1
fi

# 同步依赖
echo "📥 安装项目依赖..."
uv sync

# 验证安装
echo "✅ 验证安装..."
python -c "import open_deep_research; print('✅ 项目导入成功')"

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "⚠️  警告: .env 文件不存在"
    echo "📝 请创建 .env 文件并配置必要的 API 密钥："
    echo "   - OPENAI_API_KEY"
    echo "   - ANTHROPIC_API_KEY"
    echo "   - TAVILY_API_KEY"
    echo "   - 其他必要的 API 密钥"
fi

# 检查 langgraph CLI 是否可用
if ! command -v langgraph &> /dev/null; then
    echo "📦 安装 langgraph CLI..."
    uv add langgraph-cli[inmem]
fi

echo ""
echo "🎯 启动 LangGraph 应用..."
echo "📊 应用配置:"
echo "   - 图名称: Deep Researcher"
echo "   - 入口点: ./src/open_deep_research/deep_researcher.py:deep_researcher"
echo "   - Python 版本: 3.11"
echo ""

# 启动 LangGraph 应用
echo "🌐 启动 LangGraph 服务器..."
langgraph dev
