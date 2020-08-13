# redash
1. 汉化
2. ldap登录


## vscode debug

```
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
```

## docker部署
1. build
docker-compose build

2. 创建数据库
```
docker-compose run --rm server create_db
```
3. 启动所有组件
```
docker-compose up -d
```

## ldap 配置及其代码讲解
ldap可以看做一个目录存储结构
进入路由,调用auth_ldap_user认证函数
```
@blueprint.route(org_scoped_rule("/ldap/login"), methods=["GET", "POST"])
def login(org_slug=None):
    index_url = url_for("redash.index", org_slug=org_slug)
    unsafe_next_path = request.args.get("next", index_url)
    next_path = get_next_path(unsafe_next_path)

    if not settings.LDAP_LOGIN_ENABLED:
        logger.error("Cannot use LDAP for login without being enabled in settings")
        return redirect(url_for("redash.index", next=next_path))

    if current_user.is_authenticated:
        return redirect(next_path)

    if request.method == "POST":
        ldap_user = auth_ldap_user(request.form["email"], request.form["password"])

        if ldap_user is not None:
            user = create_and_login_user(
                current_org,
                ldap_user[settings.LDAP_DISPLAY_NAME_KEY][0],
                ldap_user[settings.LDAP_EMAIL_KEY][0],
            )
            if user is None:
                return logout_and_redirect_to_index()

            return redirect(next_path or url_for("redash.index"))
        else:
            flash("Incorrect credentials.")

```
```

def auth_ldap_user(username, password):
    # 连接服务
    server = Server(settings.LDAP_HOST_URL, use_ssl=settings.LDAP_SSL)
    if settings.LDAP_BIND_DN is not None:
        # 绑定
        conn = Connection(
            server,
            # user
            settings.LDAP_BIND_DN,
            # password
            password=settings.LDAP_BIND_DN_PASSWORD,
            # 认证方式，一般不改
            authentication=settings.LDAP_AUTH_METHOD,
            auto_bind=True,
        )
    else:
        conn = Connection(server, auto_bind=True)
    # 查询用户是否存在
    conn.search(
        # 查询根目录
        settings.LDAP_SEARCH_DN,
        # 查询条件
        settings.LDAP_SEARCH_TEMPLATE % {"username": username},
        # 查询属性
        attributes=[settings.LDAP_DISPLAY_NAME_KEY, settings.LDAP_EMAIL_KEY],
    )

    if len(conn.entries) == 0:
        return None
    # 返回用户
    user = conn.entries[0]

    # 查询用户名和密码是否匹配
    if not conn.rebind(user=user.entry_dn, password=password):
        return None

    return user
```

配置
```
# 用户名和密码
LDAP_BIND_DN = os.environ.get("REDASH_LDAP_BIND_DN", "cn=using,dc=xxx,dc=com")
LDAP_BIND_DN_PASSWORD = os.environ.get("REDASH_LDAP_BIND_DN_PASSWORD", "xxxxxx")

# 展示的用户名和邮箱，寻找ldap中对应的key
LDAP_DISPLAY_NAME_KEY = os.environ.get("REDASH_LDAP_DISPLAY_NAME_KEY", "uid")
LDAP_EMAIL_KEY = os.environ.get("REDASH_LDAP_EMAIL_KEY", "email")

# 查询条件
LDAP_SEARCH_TEMPLATE = os.environ.get(
    "REDASH_LDAP_SEARCH_TEMPLATE", "(uid=%(username)s)"
)

# 查询根目录
LDAP_SEARCH_DN = os.environ.get(
    "REDASH_LDAP_SEARCH_DN", os.environ.get("REDASH_SEARCH_DN", "ou=People,dc=xx,dc=com")
)
```


