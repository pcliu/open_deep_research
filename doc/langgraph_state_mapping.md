# LangGraph 父图和子图 State 字段传递机制

## 概述

LangGraph 中的状态管理采用自动化的字段映射机制，支持父图和子图之间的双向状态传递。这种机制确保了复杂工作流中状态的一致性和类型安全。

## 核心概念

### 1. 状态类型定义

每个图都有明确的状态类型定义：

```python
# 父图状态
class ParentState(TypedDict):
    shared_field: str
    parent_only_field: int
    messages: list[MessageLikeRepresentation]

# 子图状态
class ChildState(TypedDict):
    shared_field: str  # 与父状态同名的字段
    child_only_field: float
    messages: list[MessageLikeRepresentation]
```

### 2. 子图构建

子图在构建时需要指定状态类型：

```python
# 子图构建
child_builder = StateGraph(ChildState, config_schema=Configuration)
child_builder.add_node("child_node", child_function)
child_subgraph = child_builder.compile()

# 父图构建
parent_builder = StateGraph(ParentState, config_schema=Configuration)
parent_builder.add_node("parent_node", parent_function)
parent_builder.add_node("child_subgraph", child_subgraph)  # 添加子图
```

## 字段传递机制

### 1. 父图 → 子图传递（输入映射）

当父图调用子图时，LangGraph 自动进行字段映射：

#### 映射规则
- **同名字段自动映射**: 父状态和子状态中的同名字段会自动传递
- **类型兼容性检查**: 字段类型必须兼容
- **默认值处理**: 如果父状态中没有对应字段，使用子状态的默认值

#### 映射示例
```python
# 父状态
parent_state = {
    "shared_field": "共享数据",
    "parent_only_field": 42,
    "messages": [message1, message2]
}

# 自动映射到子状态
child_state = {
    "shared_field": "共享数据",  # ← 自动映射
    "child_only_field": 0.0,    # ← 使用默认值
    "messages": [message1, message2]  # ← 自动映射
}
```

### 2. 子图 → 父图传递（输出映射）

子图执行完成后，结果会自动映射回父状态：

#### 映射规则
- **同名字段自动更新**: 子图输出中的字段会更新父状态中的同名字段
- **Reducer 函数应用**: 使用指定的 reducer 函数处理状态更新
- **状态合并**: 支持累加、覆盖等不同的更新策略

#### 映射示例
```python
# 子图输出
child_output = {
    "shared_field": "更新后的共享数据",
    "child_only_field": 3.14,
    "messages": [new_message]
}

# 映射回父状态
parent_updates = {
    "shared_field": "更新后的共享数据",  # ← 更新父状态
    "messages": [new_message]           # ← 更新父状态
    # child_only_field 不会映射，因为父状态中没有对应字段
}
```

## Reducer 机制

### 1. 状态更新策略

LangGraph 支持多种状态更新策略：

```python
# 覆盖模式
def override_reducer(current_value, new_value):
    if isinstance(new_value, dict) and new_value.get("type") == "override":
        return new_value.get("value", new_value)
    else:
        return operator.add(current_value, new_value)

# 累加模式
researcher_messages: Annotated[list[MessageLikeRepresentation], operator.add]

# 覆盖模式
supervisor_messages: Annotated[list[MessageLikeRepresentation], override_reducer]
```

### 2. Reducer 使用示例

```python
# 在状态定义中使用 reducer
class State(TypedDict):
    # 累加模式：新消息追加到现有列表
    messages: Annotated[list[MessageLikeRepresentation], operator.add]
    
    # 覆盖模式：完全替换现有值
    current_topic: Annotated[str, override_reducer]
    
    # 自定义 reducer
    notes: Annotated[list[str], override_reducer] = []
```

## 实际应用示例

### 1. 基本传递流程

```python
# 步骤 1: 父图调用子图
async def parent_function(state: ParentState, config: RunnableConfig):
    return Command(
        goto="child_subgraph",
        update={
            "shared_field": "传递给子图的数据",
            "messages": [new_message]
        }
    )

# 步骤 2: 子图执行
async def child_function(state: ChildState, config: RunnableConfig):
    # 可以访问从父图传递来的 shared_field 和 messages
    shared_data = state.get("shared_field")
    messages = state.get("messages")
    
    # 处理逻辑...
    
    return Command(
        goto=END,
        update={
            "shared_field": "处理后的数据",
            "child_only_field": 3.14
        }
    )

# 步骤 3: 结果映射回父图
# LangGraph 自动将 child_output 中的同名字段映射回 ParentState
```

### 2. 复杂状态传递

```python
# 多层嵌套的子图调用
async def supervisor_tools(state: SupervisorState, config: RunnableConfig):
    # 调用多个研究者子图
    coros = [
        researcher_subgraph.ainvoke({
            "researcher_messages": [HumanMessage(content=topic)],
            "research_topic": topic
        }, config) 
        for topic in research_topics
    ]
    
    # 收集所有子图的结果
    results = await asyncio.gather(*coros)
    
    # 合并结果并更新状态
    return Command(
        goto="supervisor",
        update={
            "supervisor_messages": tool_messages,
            "raw_notes": [concatenated_notes]
        }
    )
```

## 最佳实践

### 1. 状态设计原则

- **明确字段用途**: 每个字段应该有明确的用途和生命周期
- **避免字段冲突**: 不同状态类型中的同名字段应该有相同的语义
- **合理使用 reducer**: 根据业务需求选择合适的更新策略

### 2. 调试技巧

```python
# 调试状态映射
def debug_state_mapping(parent_state_type, child_state_type):
    print(f"Parent state fields: {parent_state_type.__annotations__.keys()}")
    print(f"Child state fields: {child_state_type.__annotations__.keys()}")
    
    # 找出匹配的字段
    matching_fields = set(parent_state_type.__annotations__.keys()) & set(child_state_type.__annotations__.keys())
    print(f"Matching fields: {matching_fields}")
    
    # 检查类型兼容性
    for field in matching_fields:
        parent_type = parent_state_type.__annotations__[field]
        child_type = child_state_type.__annotations__[field]
        print(f"Field '{field}': {parent_type} vs {child_type}")
```

### 3. 常见陷阱

- **字段名不匹配**: 确保父状态和子状态中的同名字段拼写一致
- **类型不兼容**: 检查字段类型是否兼容
- **Reducer 使用错误**: 确保 reducer 函数能正确处理数据类型

## 总结

LangGraph 的状态映射机制提供了：

- **自动化**: 无需手动指定映射关系
- **类型安全**: 通过状态类型定义确保安全
- **灵活性**: 支持多种更新策略
- **透明性**: 映射过程对开发者透明

这种设计使得复杂的状态管理变得简单而可靠，确保了数据在多层状态之间的正确传递和更新。 