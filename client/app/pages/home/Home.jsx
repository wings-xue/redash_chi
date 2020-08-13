import { includes, isEmpty } from "lodash";
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import Alert from "antd/lib/alert";
import Icon from "antd/lib/icon";
import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import EmptyState from "@/components/empty-state/EmptyState";
import DynamicComponent from "@/components/DynamicComponent";
import BeaconConsent from "@/components/BeaconConsent";

import { axios } from "@/services/axios";
import recordEvent from "@/services/recordEvent";
import { messages } from "@/services/auth";
import notification from "@/services/notification";
import { Dashboard } from "@/services/dashboard";
import { Query } from "@/services/query";
import routes from "@/services/routes";

import "./Home.less";

function DeprecatedEmbedFeatureAlert() {
  return (
    <Alert
      className="m-b-15"
      type="warning"
      message={
        <>
          你已设置参数 <code>ALLOW_PARAMETERS_IN_EMBEDS</code>，但这个特征暂时不可用。{" "}
          <a
            href="https://discuss.redash.io/t/support-for-parameters-in-embedded-visualizations/3337"
            target="_blank"
            rel="noopener noreferrer">
            Read more
          </a>
          .
        </>
      }
    />
  );
}

function EmailNotVerifiedAlert() {
  const verifyEmail = () => {
    axios.post("verification_email/").then(data => {
      notification.success(data.message);
    });
  };

  return (
    <Alert
      className="m-b-15"
      type="warning"
      message={
        <>
          电子邮箱校验邮件已发送，请查收并点击邮件里的链接，已确认邮箱输入正确。{" "}
          <a className="clickable" onClick={verifyEmail}>
            重新发送邮件
          </a>
          .
        </>
      }
    />
  );
}

function FavoriteList({ title, resource, itemUrl, emptyState }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    resource
      .favorites()
      .then(({ results }) => setItems(results))
      .finally(() => setLoading(false));
  }, [resource]);

  return (
    <>
      <div className="d-flex align-items-center m-b-20">
        <p className="flex-fill f-500 c-black m-0">{title}</p>
        {loading && <Icon type="loading" />}
      </div>
      {!isEmpty(items) && (
        <div className="list-group">
          {items.map(item => (
            <a key={itemUrl(item)} className="list-group-item" href={itemUrl(item)}>
              <span className="btn-favourite m-r-5">
                <i className="fa fa-star" aria-hidden="true" />
              </span>
              {item.name}
              {item.is_draft && <span className="label label-default m-l-5">草稿</span>}
            </a>
          ))}
        </div>
      )}
      {isEmpty(items) && !loading && emptyState}
    </>
  );
}

FavoriteList.propTypes = {
  title: PropTypes.string.isRequired,
  resource: PropTypes.func.isRequired, // eslint-disable-line react/forbid-prop-types
  itemUrl: PropTypes.func.isRequired,
  emptyState: PropTypes.node,
};
FavoriteList.defaultProps = { emptyState: null };

function DashboardAndQueryFavoritesList() {
  return (
    <div className="tile">
      <div className="t-body tb-padding">
        <div className="row home-favorites-list">
          <div className="col-sm-6 m-t-20">
            <FavoriteList
              title="我关注的报表"
              resource={Dashboard}
              itemUrl={dashboard => dashboard.url}
              emptyState={
                <p>
                  <span className="btn-favourite m-r-5">
                    <i className="fa fa-star" aria-hidden="true" />
                  </span>
                  <a href="dashboards">关注的报表</a>
                </p>
              }
            />
          </div>
          <div className="col-sm-6 m-t-20">
            <FavoriteList
              title="我关注的查询"
              resource={Query}
              itemUrl={query => `queries/${query.id}`}
              emptyState={
                <p>
                  <span className="btn-favourite m-r-5">
                    <i className="fa fa-star" aria-hidden="true" />
                  </span>
                  <a href="queries">关注的查询</a>
                </p>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Home() {
  useEffect(() => {
    recordEvent("view", "page", "personal_homepage");
  }, []);

  return (
    <div className="home-page">
      <div className="container">
        {includes(messages, "using-deprecated-embed-feature") && <DeprecatedEmbedFeatureAlert />}
        {includes(messages, "email-not-verified") && <EmailNotVerifiedAlert />}
        <EmptyState
          header="欢迎使用 Redash 👋"
          description="连接任何数据源，轻松看见和分享数据。"
          illustration="dashboard"
          helpLink="https://redash.io/help/user-guide/getting-started"
          showDashboardStep
          showInviteStep
          onboardingMode
        />
        <DynamicComponent name="HomeExtra" />
        <DashboardAndQueryFavoritesList />
        <BeaconConsent />
      </div>
    </div>
  );
}

routes.register(
  "Home",
  routeWithUserSession({
    path: "/",
    title: "Redash",
    render: pageProps => <Home {...pageProps} />,
  })
);
