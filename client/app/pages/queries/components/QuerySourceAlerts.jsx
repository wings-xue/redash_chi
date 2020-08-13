import React from "react";
import PropTypes from "prop-types";
import Card from "antd/lib/card";
import Icon from "antd/lib/icon";
import Button from "antd/lib/button";
import Typography from "antd/lib/typography";
import { currentUser } from "@/services/auth";

import useQueryFlags from "../hooks/useQueryFlags";
import "./QuerySourceAlerts.less";

export default function QuerySourceAlerts({ query, dataSourcesAvailable }) {
  const queryFlags = useQueryFlags(query); // we don't use flags that depend on data source

  let message = null;
  if (queryFlags.isNew && !queryFlags.canCreate) {
    message = (
      <React.Fragment>
        <Typography.Title level={4}>
          没有任何数据源权限，不能创建查询。
        </Typography.Title>
        <p>
          <Typography.Text type="secondary">
            你可以<a href="queries">查看查询</a>，或者联系系统管理员申请权限。
          </Typography.Text>
        </p>
      </React.Fragment>
    );
  } else if (!dataSourcesAvailable) {
    if (currentUser.isAdmin) {
      message = (
        <React.Fragment>
          <Typography.Title level={4}>
            没有创建数据源，或者没有任何数据源权限。
          </Typography.Title>
          <p>
            <Typography.Text type="secondary">请先建立数据源然后再创建查询。</Typography.Text>
          </p>

          <div className="query-source-alerts-actions">
            <Button type="primary" href="data_sources/new">
              创建数据源
            </Button>
            <Button type="default" href="groups">
              管理角色权限
            </Button>
          </div>
        </React.Fragment>
      );
    } else {
      message = (
        <React.Fragment>
          <Typography.Title level={4}>
          没有创建数据源，或者没有任何数据源权限。
          </Typography.Title>
          <p>
            <Typography.Text type="secondary">请联系系统管理员先创建数据源。</Typography.Text>
          </p>
        </React.Fragment>
      );
    }
  }

  if (!message) {
    return null;
  }

  return (
    <div className="query-source-alerts">
      <Card>
        <div className="query-source-alerts-icon">
          <Icon type="warning" theme="filled" />
        </div>
        {message}
      </Card>
    </div>
  );
}

QuerySourceAlerts.propTypes = {
  query: PropTypes.object.isRequired,
  dataSourcesAvailable: PropTypes.bool,
};

QuerySourceAlerts.defaultProps = {
  dataSourcesAvailable: false,
};
