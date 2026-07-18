# Supabase 数据同步配置指南

## 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com/) 并注册账号
2. 创建新项目（免费套餐即可）
3. 记下项目的 `URL` 和 `anon key`

## 2. 在 Supabase 控制台执行 SQL

在 Supabase 控制台的 **SQL Editor** 中执行以下脚本：

```sql
CREATE TABLE app_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  sync_version BIGINT DEFAULT 1,
  last_modified TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_app_data_user_id ON app_data(user_id);
CREATE INDEX idx_app_data_sync_version ON app_data(sync_version);
CREATE INDEX idx_app_data_last_modified ON app_data(last_modified);

ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own data"
  ON app_data FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to insert"
  ON app_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## 3. 启用实时功能

1. 在 Supabase 控制台进入 **Realtime**
2. 启用 `app_data` 表的实时监听

## 4. 配置环境变量

在项目根目录创建 `.env` 文件：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-from-supabase
```

将 `your-project-id` 和 `your-anon-key-from-supabase` 替换为实际值。

## 5. 启动项目

```bash
npm run dev
```

## 工作原理

1. **数据存储**：所有应用数据以 JSONB 格式存储在单个 `app_data` 表中，与现有的 localStorage 结构保持一致
2. **实时同步**：使用 Supabase Realtime 监听表变更，其他设备修改数据时自动推送更新
3. **版本控制**：通过 `sync_version` 和 `last_modified` 字段进行冲突检测
4. **用户隔离**：通过 RLS (Row Level Security) 确保每个用户只能访问自己的数据