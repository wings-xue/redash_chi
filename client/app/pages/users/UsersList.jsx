import { isString, map, get, find } from "lodash";
import React from "react";
import PropTypes from "prop-types";

import Button from "antd/lib/button";
import Modal from "antd/lib/modal";
import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import Paginator from "@/components/Paginator";
import DynamicComponent from "@/components/DynamicComponent";
import { UserPreviewCard } from "@/components/PreviewCard";
import InputWithCopy from "@/components/InputWithCopy";

import { wrap as itemsList, ControllerType } from "@/components/items-list/ItemsList";
import { ResourceItemsSource } from "@/components/items-list/classes/ItemsSource";
import { UrlStateStorage } from "@/components/items-list/classes/StateStorage";

import LoadingState from "@/components/items-list/components/LoadingState";
import EmptyState from "@/components/items-list/components/EmptyState";
import * as Sidebar from "@/components/items-list/components/Sidebar";
import ItemsTable, { Columns } from "@/components/items-list/components/ItemsTable";

import Layout from "@/components/layouts/ContentWithSidebar";
import wrapSettingsTab from "@/components/SettingsWrapper";

import { currentUser } from "@/services/auth";
import { policy } from "@/services/policy";
import User from "@/services/user";
import navigateTo from "@/components/ApplicationArea/navigateTo";
import notification from "@/services/notification";
import { absoluteUrl } from "@/services/utils";
import routes from "@/services/routes";

import CreateUserDialog from "./components/CreateUserDialog";

function UsersListActions({ user, enableUser, disableUser, deleteUser }) {
  if (user.id === currentUser.id) {
    return null;
  }
  if (user.is_invitation_pending) {
    return (
      <Button type="danger" className="w-100" onClick={event => deleteUser(event, user)}>
        删除
      </Button>
    );
  }
  return user.is_disabled ? (
    <Button type="primary" className="w-100" onClick={event => enableUser(event, user)}>
      启用
    </Button>
  ) : (
    <Button className="w-100" onClick={event => disableUser(event, user)}>
      停用
    </Button>
  );
}

UsersListActions.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number,
    is_invitation_pending: PropTypes.bool,
    is_disabled: PropTypes.bool,
  }).isRequired,
  enableUser: PropTypes.func.isRequired,
  disableUser: PropTypes.func.isRequired,
  deleteUser: PropTypes.func.isRequired,
};

class UsersList extends React.Component {
  static propTypes = {
    controller: ControllerType.isRequired,
  };

  sidebarMenu = [
    {
      key: "active",
      href: "users",
      title: "活动的用户",
    },
    {
      key: "pending",
      href: "users/pending",
      title: "邀请的用户",
    },
    {
      key: "disabled",
      href: "users/disabled",
      title: "停用的用户",
      isAvailable: () => policy.canCreateUser(),
    },
  ];

  listColumns = [
    Columns.custom.sortable((text, user) => <UserPreviewCard user={user} withLink />, {
      title: "名称",
      field: "name",
      width: null,
    }),
    Columns.custom.sortable(
      (text, user) =>
        map(user.groups, group => (
          <a key={"group" + group.id} className="label label-tag" href={"groups/" + group.id}>
            {group.name}
          </a>
        )),
      {
        title: "角色",
        field: "groups",
      }
    ),
    Columns.timeAgo.sortable({
      title: "创建时间",
      field: "created_at",
      className: "text-nowrap",
      width: "1%",
    }),
    Columns.timeAgo.sortable({
      title: "激活时间",
      field: "active_at",
      className: "text-nowrap",
      width: "1%",
    }),
    Columns.custom(
      (text, user) => (
        <UsersListActions
          user={user}
          enableUser={this.enableUser}
          disableUser={this.disableUser}
          deleteUser={this.deleteUser}
        />
      ),
      {
        width: "1%",
        isAvailable: () => policy.canCreateUser(),
      }
    ),
  ];

  componentDidMount() {
    if (this.props.controller.params.isNewUserPage) {
      this.showCreateUserDialog();
    }
  }

  createUser = values =>
    User.create(values)
      .then(user => {
        notification.success("保存成功！");
        if (user.invite_link) {
          Modal.warning({
            title: "邮件未能发送。",
            okText: "确定",
            cancelText: "取消",
            content: (
              <React.Fragment>
                <p>
                  由于系统没有配置电子邮件服务器，邀请用户自行激活账户的电子邮件未能自动发送；请复制下列激活链接地址给<b>{user.name}</b>，自行点击激活:
                </p>
                <InputWithCopy value={absoluteUrl(user.invite_link)} readOnly />
              </React.Fragment>
            ),
          });
        }
      })
      .catch(error => {
        const message = find([get(error, "response.data.message"), get(error, "message"), "保存失败。"], isString);
        return Promise.reject(new Error(message));
      });

  showCreateUserDialog = () => {
    if (policy.isCreateUserEnabled()) {
      const goToUsersList = () => {
        if (this.props.controller.params.isNewUserPage) {
          navigateTo("users");
        }
      };
      CreateUserDialog.showModal()
        .onClose(values =>
          this.createUser(values).then(() => {
            this.props.controller.update();
            goToUsersList();
          })
        )
        .onDismiss(goToUsersList);
    }
  };

  enableUser = (event, user) => User.enableUser(user).then(() => this.props.controller.update());

  disableUser = (event, user) => User.disableUser(user).then(() => this.props.controller.update());

  deleteUser = (event, user) => User.deleteUser(user).then(() => this.props.controller.update());

  // eslint-disable-next-line class-methods-use-this
  renderPageHeader() {
    if (!policy.canCreateUser()) {
      return null;
    }
    return (
      <div className="m-b-15">
        <Button type="primary" disabled={!policy.isCreateUserEnabled()} onClick={this.showCreateUserDialog}>
          <i className="fa fa-plus m-r-5" />
          新建用户
        </Button>
        <DynamicComponent name="UsersListExtra" />
      </div>
    );
  }

  render() {
    const { controller } = this.props;
    return (
      <React.Fragment>
        {this.renderPageHeader()}
        <Layout>
          <Layout.Sidebar className="m-b-0">
            <Sidebar.SearchInput value={controller.searchTerm} onChange={controller.updateSearch} />
            <Sidebar.Menu items={this.sidebarMenu} selected={controller.params.currentPage} />
          </Layout.Sidebar>
          <Layout.Content>
            {!controller.isLoaded && <LoadingState className="" />}
            {controller.isLoaded && controller.isEmpty && <EmptyState className="" />}
            {controller.isLoaded && !controller.isEmpty && (
              <div className="table-responsive" data-test="UserList">
                <ItemsTable
                  items={controller.pageItems}
                  columns={this.listColumns}
                  context={this.actions}
                  orderByField={controller.orderByField}
                  orderByReverse={controller.orderByReverse}
                  toggleSorting={controller.toggleSorting}
                />
                <Paginator
                  showPageSizeSelect
                  totalCount={controller.totalItemsCount}
                  pageSize={controller.itemsPerPage}
                  onPageSizeChange={itemsPerPage => controller.updatePagination({ itemsPerPage })}
                  page={controller.page}
                  onChange={page => controller.updatePagination({ page })}
                />
              </div>
            )}
          </Layout.Content>
        </Layout>
      </React.Fragment>
    );
  }
}

const UsersListPage = wrapSettingsTab(
  "Users.List",
  {
    permission: "list_users",
    title: "用户",
    path: "users",
    isActive: path => path.startsWith("/users") && path !== "/users/me",
    order: 2,
  },
  itemsList(
    UsersList,
    () =>
      new ResourceItemsSource({
        getRequest(request, { params: { currentPage } }) {
          switch (currentPage) {
            case "active":
              request.pending = false;
              break;
            case "pending":
              request.pending = true;
              break;
            case "disabled":
              request.disabled = true;
              break;
            // no default
          }
          return request;
        },
        getResource() {
          return User.query.bind(User);
        },
      }),
    () => new UrlStateStorage({ orderByField: "created_at", orderByReverse: true })
  )
);

routes.register(
  "Users.New",
  routeWithUserSession({
    path: "/users/new",
    title: "用户",
    render: pageProps => <UsersListPage {...pageProps} currentPage="active" isNewUserPage />,
  })
);
routes.register(
  "Users.List",
  routeWithUserSession({
    path: "/users",
    title: "活动的用户",
    render: pageProps => <UsersListPage {...pageProps} currentPage="active" />,
  })
);
routes.register(
  "Users.Pending",
  routeWithUserSession({
    path: "/users/pending",
    title: "邀请的用户",
    render: pageProps => <UsersListPage {...pageProps} currentPage="pending" />,
  })
);
routes.register(
  "Users.Disabled",
  routeWithUserSession({
    path: "/users/disabled",
    title: "停用的用户",
    render: pageProps => <UsersListPage {...pageProps} currentPage="disabled" />,
  })
);
