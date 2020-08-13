redash部署


1. 汉化
2. ldap登录

{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: Current File",
            "type": "python",
            "request": "launch",
            "program": "${workspaceRoot}/manage.py",
            "args": ["run", "-p 6333"],
            "console": "integratedTerminal"
        }
    ]
}


## 部署
1. 创建数据库
```
docker-compose run --rm server create_db
```
2. 启动所有组件
```
docker-compose up -d
```

