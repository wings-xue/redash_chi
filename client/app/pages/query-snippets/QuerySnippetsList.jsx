import { get } from "lodash";
import React from "react";

import Button from "antd/lib/button";
import Modal from "antd/lib/modal";
import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import navigateTo from "@/components/ApplicationArea/navigateTo";
import Paginator from "@/components/Paginator";
import QuerySnippetDialog from "@/components/query-snippets/QuerySnippetDialog";

import { wrap as itemsList, ControllerType } from "@/components/items-list/ItemsList";
import { ResourceItemsSource } from "@/components/items-list/classes/ItemsSource";
import { StateStorage } from "@/components/items-list/classes/StateStorage";

import LoadingState from "@/components/items-list/components/LoadingState";
import ItemsTable, { Columns } from "@/components/items-list/components/ItemsTable";
import wrapSettingsTab from "@/components/SettingsWrapper";

import QuerySnippet from "@/services/query-snippet";
import { currentUser } from "@/services/auth";
import { policy } from "@/services/policy";
import notification from "@/services/notification";
import routes from "@/services/routes";

import "./QuerySnippetsList.less";

const canEditQuerySnippet = querySnippet => currentUser.isAdmin || currentUser.id === get(querySnippet, "user.id");

class QuerySnippetsList extends React.Component {
  static propTypes = {
    controller: ControllerType.isRequired,
  };

  listColumns = [
    Columns.custom.sortable(
      (text, querySnippet) => (
        <div>
          <a className="table-main-title clickable" onClick={() => this.showSnippetDialog(querySnippet)}>
            {querySnippet.trigger}
          </a>
        </div>
      ),
      {
        title: "代码",
        field: "trigger",
        className: "text-nowrap",
      }
    ),
    Columns.custom.sortable(text => text, {
      title: "描述",
      field: "description",
      className: "text-nowrap",
    }),
    Columns.custom(snippet => <code className="snippet-content">{snippet}</code>, {
      title: "脚本",
      field: "snippet",
    }),
    Columns.avatar({ field: "user", className: "p-l-0 p-r-0" }, name => `创建人 ${name}`),
    Columns.date.sortable({
      title: "创建时间",
      field: "created_at",
      className: "text-nowrap",
      width: "1%",
    }),
    Columns.custom(
      (text, querySnippet) =>
        canEditQuerySnippet(querySnippet) && (
          <Button type="danger" className="w-100" onClick={e => this.deleteQuerySnippet(e, querySnippet)}>
            删除
          </Button>
        ),
      {
        width: "1%",
      }
    ),
  ];

  componentDidMount() {
    const { isNewOrEditPage, querySnippetId } = this.props.controller.params;

    if (isNewOrEditPage) {
      if (querySnippetId === "new") {
        if (policy.isCreateQuerySnippetEnabled()) {
          this.showSnippetDialog();
        } else {
          navigateTo("query_snippets", true);
        }
      } else {
        QuerySnippet.get({ id: querySnippetId })
          .then(this.showSnippetDialog)
          .catch(error => {
            this.props.controller.handleError(error);
          });
      }
    }
  }

  saveQuerySnippet = querySnippet => {
    const saveSnippet = querySnippet.id ? QuerySnippet.save : QuerySnippet.create;
    return saveSnippet(querySnippet);
  };

  deleteQuerySnippet = (event, querySnippet) => {
    Modal.confirm({
      title: "删除常用查询脚本",
      content: "确定要删除常用查询脚本吗？",
      okText: "确定",
      okType: "danger",
      cancelText: "取消",
      onOk: () => {
        QuerySnippet.delete(querySnippet)
          .then(() => {
            notification.success("常用查询脚本删除成功！");
            this.props.controller.update();
          })
          .catch(() => {
            notification.error("常用查询脚本删除失败。");
          });
      },
    });
  };

  showSnippetDialog = (querySnippet = null) => {
    const canSave = !querySnippet || canEditQuerySnippet(querySnippet);
    navigateTo("query_snippets/" + get(querySnippet, "id", "new"), true);
    const goToSnippetsList = () => navigateTo("query_snippets", true);
    QuerySnippetDialog.showModal({
      querySnippet,
      readOnly: !canSave,
    })
      .onClose(querySnippet =>
        this.saveQuerySnippet(querySnippet).then(() => {
          this.props.controller.update();
          goToSnippetsList();
        })
      )
      .onDismiss(goToSnippetsList);
  };

  render() {
    const { controller } = this.props;

    return (
      <div>
        <div className="m-b-15">
          <Button
            type="primary"
            onClick={() => this.showSnippetDialog()}
            disabled={!policy.isCreateQuerySnippetEnabled()}>
            <i className="fa fa-plus m-r-5" />
            新建常用查询脚本
          </Button>
        </div>

        {!controller.isLoaded && <LoadingState className="" />}
        {controller.isLoaded && controller.isEmpty && (
          <div className="text-center">
            还没有创建常用查询脚本，点击
            {policy.isCreateQuerySnippetEnabled() && (
              <div className="m-t-5">
                <a className="clickable" onClick={() => this.showSnippetDialog()}>
                  新建常用查询脚本
                </a>{" "}
              </div>
            )}
          </div>
        )}
        {controller.isLoaded && !controller.isEmpty && (
          <div className="table-responsive">
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
      </div>
    );
  }
}

const QuerySnippetsListPage = wrapSettingsTab(
  "QuerySnippets.List",
  {
    permission: "create_query",
    title: "常用查询脚本",
    path: "query_snippets",
    order: 5,
  },
  itemsList(
    QuerySnippetsList,
    () =>
      new ResourceItemsSource({
        isPlainList: true,
        getRequest() {
          return {};
        },
        getResource() {
          return QuerySnippet.query.bind(QuerySnippet);
        },
      }),
    () => new StateStorage({ orderByField: "trigger", itemsPerPage: 10 })
  )
);

routes.register(
  "QuerySnippets.List",
  routeWithUserSession({
    path: "/query_snippets",
    title: "常用查询脚本",
    render: pageProps => <QuerySnippetsListPage {...pageProps} currentPage="query_snippets" />,
  })
);
routes.register(
  "QuerySnippets.NewOrEdit",
  routeWithUserSession({
    path: "/query_snippets/:querySnippetId",
    title: "常用查询脚本",
    render: pageProps => <QuerySnippetsListPage {...pageProps} currentPage="query_snippets" isNewOrEditPage />,
  })
);
