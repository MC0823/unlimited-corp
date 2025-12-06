-- 创建数据库用户
CREATE USER unlimited WITH PASSWORD 'unlimited123';

-- 创建数据库
CREATE DATABASE unlimited_corp OWNER unlimited;

-- 授予权限
GRANT ALL PRIVILEGES ON DATABASE unlimited_corp TO unlimited;

-- 连接到新数据库并创建表
\c unlimited_corp unlimited

-- 运行项目的初始化 SQL
