import React from "react";

import Button from "antd/lib/button";
import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import PageHeader from "@/components/PageHeader";
import Paginator from "@/components/Paginator";
import { QueryTagsControl } from "@/components/tags-control/TagsControl";
import SchedulePhrase from "@/components/queries/SchedulePhrase";

import { wrap as itemsList, ControllerType } from "@/components/items-list/ItemsList";
import { ResourceItemsSource } from "@/components/items-list/classes/ItemsSource";
import { UrlStateStorage } from "@/components/items-list/classes/StateStorage";

import LoadingState from "@/components/items-list/components/LoadingState";
import * as Sidebar from "@/components/items-list/components/Sidebar";
import ItemsTable, { Columns } from "@/components/items-list/components/ItemsTable";

import Layout from "@/components/layouts/ContentWithSidebar";

import { Query } from "@/services/query";
import { currentUser } from "@/services/auth";
import location from "@/services/location";
import routes from "@/services/routes";

import QueriesListEmptyState from "./QueriesListEmptyState";

import "./queries-list.css";

class QueriesList extends React.Component {
  static propTypes = {
    controller: ControllerType.isRequired,
  };

  sidebarMenu = [
    {
      key: "all",
      href: "queries",
      title: "所有查询",
    },
    {
      key: "favorites",
      href: "queries/favorites",
      title: "我关注的查询",
      icon: () => <Sidebar.MenuIcon icon="fa fa-star" />,
    },
    {
      key: "my",
      href: "queries/my",
      title: "我的查询",
      icon: () => <Sidebar.ProfileImage user={currentUser} />,
      isAvailable: () => currentUser.hasPermission("create_query"),
    },
    {
      key: "archive",
      href: "queries/archive",
      title: "归档的查询",
      icon: () => <Sidebar.MenuIcon icon="fa fa-archive" />,
    },
  ];

  listColumns = [
    Columns.favorites({ className: "p-r-0" }),
    Columns.custom.sortable(
      (text, item) => (
        <React.Fragment>
          <a className="table-main-title" href={"queries/" + item.id}>
            {item.name}
          </a>
          <QueryTagsControl
            className="d-block"
            tags={item.tags}
            isDraft={item.is_draft}
            isArchived={item.is_archived}
          />
        </React.Fragment>
      ),
      {
        title: "名称",
        field: "name",
        width: null,
      }
    ),
    Columns.custom((text, item) => item.user.name, { title: "创建人" }),
    Columns.dateTime.sortable({ title: "创建时间", field: "created_at" }),
    Columns.dateTime.sortable({ title: "最后执行时间", field: "retrieved_at", orderByField: "executed_at" }),
    Columns.custom.sortable((text, item) => <SchedulePhrase schedule={item.schedule} isNew={item.isNew()} />, {
      title: "自动刷新",
      field: "schedule",
    }),
  ];

  componentDidMount() {
    this.unlistenLocationChanges = location.listen((unused, action) => {
      const searchTerm = location.search.q || "";
      if (action === "PUSH" && searchTerm !== this.props.controller.searchTerm) {
        this.props.controller.updateSearch(searchTerm);
      }
    });
  }

  componentWillUnmount() {
    if (this.unlistenLocationChanges) {
      this.unlistenLocationChanges();
      this.unlistenLocationChanges = null;
    }
  }

  render() {
    const { controller } = this.props;
    return (
      <div className="page-queries-list">
        <div className="container">
          <PageHeader
            title={controller.params.pageTitle}
            actions={
              currentUser.hasPermission("create_query") ? (
                <Button block type="primary" href="queries/new">
                  <i className="fa fa-plus m-r-5" />
                  新建查询
                </Button>
              ) : null
            }
          />
          <Layout>
            <Layout.Sidebar className="m-b-0">
              <Sidebar.SearchInput
                placeholder="搜索查询..."
                value={controller.searchTerm}
                onChange={controller.updateSearch}
              />
              <Sidebar.Menu items={this.sidebarMenu} selected={controller.params.currentPage} />
              <Sidebar.Tags url="api/queries/tags" onChange={controller.updateSelectedTags} />
            </Layout.Sidebar>
            <Layout.Content>
              {!controller.isLoaded && <LoadingState />}
              {controller.isLoaded && controller.isEmpty && (
                <QueriesListEmptyState
                  page={controller.params.currentPage}
                  searchTerm={controller.searchTerm}
                  selectedTags={controller.selectedTags}
                />
              )}
              {controller.isLoaded && !controller.isEmpty && (
                <div className="bg-white tiled table-responsive">
                  <ItemsTable
                    items={controller.pageItems}
                    columns={this.listColumns}
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
        </div>
      </div>
    );
  }
}

const QueriesListPage = itemsList(
  QueriesList,
  () =>
    new ResourceItemsSource({
      getResource({ params: { currentPage } }) {
        return {
          all: Query.query.bind(Query),
          my: Query.myQueries.bind(Query),
          favorites: Query.favorites.bind(Query),
          archive: Query.archive.bind(Query),
        }[currentPage];
      },
      getItemProcessor() {
        return item => new Query(item);
      },
    }),
  () => new UrlStateStorage({ orderByField: "created_at", orderByReverse: true })
);

routes.register(
  "Queries.List",
  routeWithUserSession({
    path: "/queries",
    title: "所有查询",
    render: pageProps => <QueriesListPage {...pageProps} currentPage="all" />,
  })
);
routes.register(
  "Queries.Favorites",
  routeWithUserSession({
    path: "/queries/favorites",
    title: "我关注的查询",
    render: pageProps => <QueriesListPage {...pageProps} currentPage="favorites" />,
  })
);
routes.register(
  "Queries.Archived",
  routeWithUserSession({
    path: "/queries/archive",
    title: "归档的查询",
    render: pageProps => <QueriesListPage {...pageProps} currentPage="archive" />,
  })
);
routes.register(
  "Queries.My",
  routeWithUserSession({
    path: "/queries/my",
    title: "我的查询",
    render: pageProps => <QueriesListPage {...pageProps} currentPage="my" />,
  })
);
