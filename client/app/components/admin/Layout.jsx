import React from "react";
import PropTypes from "prop-types";
import Tabs from "antd/lib/tabs";
import PageHeader from "@/components/PageHeader";

import "./layout.less";

export default function Layout({ activeTab, children }) {
  return (
    <div className="admin-page-layout">
      <div className="container">
        <PageHeader title="Admin" />
        <div className="bg-white tiled">
          <Tabs className="admin-page-layout-tabs" defaultActiveKey={activeTab} animated={false} tabBarGutter={0}>
            <Tabs.TabPane key="system_status" tab={<a href="admin/status">系统状态</a>}>
              {activeTab === "system_status" ? children : null}
            </Tabs.TabPane>
            <Tabs.TabPane key="jobs" tab={<a href="admin/queries/jobs">任务队列状态</a>}>
              {activeTab === "jobs" ? children : null}
            </Tabs.TabPane>
            <Tabs.TabPane key="outdated_queries" tab={<a href="admin/queries/outdated">超期的查询</a>}>
              {activeTab === "outdated_queries" ? children : null}
            </Tabs.TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

Layout.propTypes = {
  activeTab: PropTypes.string,
  children: PropTypes.node,
};

Layout.defaultProps = {
  activeTab: "system_status",
  children: null,
};
