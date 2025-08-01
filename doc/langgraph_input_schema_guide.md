# LangGraph input_schema 详解指南

## 概述

`input_schema` 是 LangGraph 中用于定义图输入接口的核心机制。它指定了外部用户如何向图提供初始数据，确保类型安全和接口清晰。本文档详细介绍了 `input_schema` 的概念、用法和最佳实践。

## 核心概念

### 1. input_schema 的作用

`input_schema` 定义了图的**输入接口**，具有以下关键作用：

- **类型定义**：指定用户输入的数据结构
- **输入验证**：确保输入数据符合预期格式
- **接口文档**：为 API 用户提供清晰的输入规范
- **类型安全**：在编译时进行类型检查

### 2. 与 state_schema 的区别

```python
StateGraph(
    state_schema=AgentState,      # 完整状态类型（内部使用）
    input_schema=AgentInputState, # 输入状态类型（外部接口）
    config_schema=Configuration
)
```

| 特性 | state_schema | input_schema |
|------|-------------|--------------|
| **用途** | 内部状态管理 | 外部输入接口 |
| **复杂度** | 包含所有业务字段 | 只包含必要输入字段 |
| **可见性** | 内部节点访问 | 外部用户可见 |
| **更新** | 节点间传递更新 | 仅在入口点设置 |

## 语法和用法

### 1. 基本语法

```python
from langgraph.graph import StateGraph
from typing import TypedDict

# 定义输入状态
class InputState(TypedDict):
    messages: list[dict]
    user_id: str

# 定义完整状态
class FullState(TypedDict):
    messages: list[dict]
    user_id: str
    internal_data: str
    processed_results: list

# 创建图
graph = StateGraph(
    state_schema=FullState,
    input_schema=InputState,
    config_schema=Configuration
)
```

### 2. 参数名称变化

#### 旧版本（已弃用）
```python
# LangGraph v0.5 之前
StateGraph(State, input=InputState, config_schema=Config)
```

#### 新版本（推荐）
```python
# LangGraph v0.5 及以后
StateGraph(State, input_schema=InputState, config_schema=Config)
```

**弃用警告**：
```python
# 会显示警告但仍可工作
warnings.warn(
    "`input` is deprecated and will be removed. Please use `input_schema` instead.",
    category=LangGraphDeprecatedSinceV05
)
```

## 实际应用示例

### 1. Open Deep Research 项目示例

#### 输入状态定义
```python
class AgentInputState(MessagesState):
    """InputState is only 'messages'"""
    # 继承自 MessagesState，只包含 messages 字段
```

#### 完整状态定义
```python
class AgentState(MessagesState):
    supervisor_messages: Annotated[list[MessageLikeRepresentation], override_reducer]
    research_brief: Optional[str]
    raw_notes: Annotated[list[str], override_reducer] = []
    notes: Annotated[list[str], override_reducer] = []
    final_report: str
```

#### 图构建
```python
deep_researcher_builder = StateGraph(
    AgentState,           # 完整状态
    input_schema=AgentInputState,  # 输入状态
    config_schema=Configuration
)
```

### 2. 用户输入示例

#### 用户视角（简单）
```json
{
  "messages": [
    {
      "role": "user",
      "content": "请研究人工智能在医疗诊断中的应用"
    }
  ]
}
```

#### 系统内部（复杂）
```python
{
  "messages": [用户消息],
  "supervisor_messages": [],
  "research_brief": None,
  "raw_notes": [],
  "notes": [],
  "final_report": ""
}
```

## 状态映射机制

### 1. 自动映射过程

LangGraph 自动处理输入状态到完整状态的映射：

```python
# 步骤 1: 验证输入
input_data = {
    "messages": [{"role": "user", "content": "研究AI"}]
}
# LangGraph 验证 input_data 符合 AgentInputState 格式

# 步骤 2: 状态转换
full_state = {
    "messages": [{"role": "user", "content": "研究AI"}],  # 映射
    "supervisor_messages": [],                            # 默认值
    "research_brief": None,                              # 默认值
    "raw_notes": [],                                     # 默认值
    "notes": [],                                         # 默认值
    "final_report": ""                                   # 默认值
}
```

### 2. 映射规则

- **同名字段映射**：输入状态中的字段自动映射到完整状态
- **类型兼容性**：确保字段类型匹配
- **默认值填充**：缺失字段使用完整状态中的默认值
- **字段过滤**：输入状态中不存在的字段不会影响完整状态

## 设计模式

### 1. 最小输入原则

```python
# 好的设计：只包含必要的输入字段
class UserInput(TypedDict):
    query: str
    user_preferences: dict

# 避免：包含内部状态字段
class BadInput(TypedDict):
    query: str
    internal_processing_status: str  # 不应该在输入中
    system_generated_id: str         # 不应该在输入中
```

### 2. 类型安全设计

```python
from typing import TypedDict, Optional, List
from pydantic import BaseModel

# 使用 TypedDict 定义输入状态
class InputState(TypedDict):
    messages: List[dict]
    user_id: str
    options: Optional[dict]

# 或使用 Pydantic 模型
class InputModel(BaseModel):
    messages: List[dict]
    user_id: str
    options: Optional[dict] = None
```

### 3. 渐进式状态扩展

```python
# 基础输入状态
class BaseInput(TypedDict):
    query: str

# 扩展输入状态
class ExtendedInput(BaseInput):
    context: Optional[str]
    metadata: Optional[dict]

# 完整状态
class FullState(ExtendedInput):
    internal_id: str
    processing_status: str
    results: List[dict]
```

## 最佳实践

### 1. 输入状态设计

#### 保持简单
```python
# ✅ 推荐：简单明确的输入
class SimpleInput(TypedDict):
    user_message: str
    language: str = "zh-CN"

# ❌ 避免：复杂的输入结构
class ComplexInput(TypedDict):
    user_message: str
    language: str
    system_config: dict
    internal_flags: List[str]
    processing_options: dict
```

#### 提供默认值
```python
class InputWithDefaults(TypedDict):
    query: str
    max_results: int = 10
    include_metadata: bool = False
```

### 2. 错误处理

```python
# 输入验证
def validate_input(input_data: dict) -> AgentInputState:
    try:
        # 验证必要字段
        if "messages" not in input_data:
            raise ValueError("Missing required field: messages")
        
        # 验证消息格式
        messages = input_data["messages"]
        if not isinstance(messages, list):
            raise ValueError("messages must be a list")
        
        return input_data
    except Exception as e:
        raise ValueError(f"Invalid input: {e}")
```

### 3. 文档化

```python
class AgentInputState(MessagesState):
    """
    用户输入状态定义
    
    字段说明：
    - messages: 用户消息列表，格式为 [{"role": "user", "content": "消息内容"}]
    
    示例：
    {
        "messages": [
            {"role": "user", "content": "请研究量子计算"}
        ]
    }
    """
```

## 常见问题和解决方案

### 1. 类型不匹配错误

**问题**：
```python
# 输入状态
class Input(TypedDict):
    count: int

# 完整状态
class State(TypedDict):
    count: str  # 类型不匹配！

# 错误：TypeError: Expected int, got str
```

**解决方案**：
```python
# 确保类型一致
class Input(TypedDict):
    count: int

class State(TypedDict):
    count: int  # 类型匹配
```

### 2. 字段缺失错误

**问题**：
```python
# 用户输入缺少必要字段
input_data = {"message": "hello"}  # 缺少 messages 字段
```

**解决方案**：
```python
# 提供清晰的错误信息
def validate_input(input_data: dict) -> AgentInputState:
    if "messages" not in input_data:
        raise ValueError(
            "Missing required field 'messages'. "
            "Expected format: {'messages': [{'role': 'user', 'content': '...'}]}"
        )
    return input_data
```

### 3. 向后兼容性

**问题**：更新 input_schema 后，现有客户端可能无法工作

**解决方案**：
```python
# 使用可选字段
class NewInput(TypedDict):
    messages: List[dict]
    new_field: Optional[str] = None  # 新字段设为可选

# 或使用版本化
class InputV1(TypedDict):
    messages: List[dict]

class InputV2(InputV1):
    new_field: str
```

## 调试技巧

### 1. 输入验证调试

```python
# 启用调试模式
graph = StateGraph(
    state_schema=State,
    input_schema=Input,
    config_schema=Config
).compile(debug=True)

# 查看输入模式
print(graph.get_input_jsonschema())
```

### 2. 状态映射调试

```python
# 手动测试状态映射
def test_state_mapping():
    input_data = {"messages": [{"role": "user", "content": "test"}]}
    
    # 模拟 LangGraph 的映射过程
    full_state = {
        "messages": input_data["messages"],
        "internal_field": "default_value"
    }
    
    print("Input:", input_data)
    print("Mapped State:", full_state)
```

### 3. 类型检查

```python
from typing import TypeVar, Generic

T = TypeVar('T')

class StateGraph(Generic[T]):
    def __init__(self, input_schema: type[T]):
        self.input_schema = input_schema
    
    def validate_input(self, data: dict) -> T:
        # 类型检查逻辑
        pass
```

## 总结

`input_schema` 是 LangGraph 中重要的设计模式，它实现了：

1. **关注点分离**：输入接口与内部状态分离
2. **类型安全**：编译时类型检查
3. **接口清晰**：为用户提供明确的输入规范
4. **向后兼容**：支持 API 演进

通过合理使用 `input_schema`，可以构建出：
- **用户友好的接口**：简单明确的输入格式
- **类型安全的系统**：编译时错误检测
- **可维护的代码**：清晰的接口定义
- **可扩展的架构**：支持功能演进

这种设计模式在现代 API 设计中非常重要，值得在 LangGraph 项目中广泛应用。 