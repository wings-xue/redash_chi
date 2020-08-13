import { startsWith, get } from "lodash";
import React from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import Tooltip from "antd/lib/tooltip";
import Drawer from "antd/lib/drawer";
import Icon from "antd/lib/icon";
import BigMessage from "@/components/BigMessage";
import DynamicComponent from "@/components/DynamicComponent";

import "./HelpTrigger.less";

const DOMAIN = "https://redash.io";
const HELP_PATH = "/help";
const IFRAME_TIMEOUT = 20000;
const IFRAME_URL_UPDATE_MESSAGE = "iframe_url";

export const TYPES = {
  HOME: ["", "帮助"],
  VALUE_SOURCE_OPTIONS: ["/user-guide/querying/query-parameters#Value-Source-Options", "目录：参数待选值"],
  SHARE_DASHBOARD: ["/user-guide/dashboards/sharing-dashboards", "目录：共享和嵌入报表"],
  AUTHENTICATION_OPTIONS: ["/user-guide/users/authentication-options", "目录：权限认证"],
  USAGE_DATA_SHARING: ["/open-source/admin-guide/usage-data", "帮助：匿名共享使用统计数据"],
  DS_ATHENA: ["/data-sources/amazon-athena-setup", "目录：配置Amazon Athena"],
  DS_BIGQUERY: ["/data-sources/bigquery-setup", "目录：配置BigQuery"],
  DS_URL: ["/data-sources/querying-urls", "目录：配置URL网络数据接口"],
  DS_MONGODB: ["/data-sources/mongodb-setup", "目录：如何设置MongoDB数据库"],
  DS_GOOGLE_SPREADSHEETS: ["/data-sources/querying-a-google-spreadsheet", "目录：如何设置Google Spreadsheets"],
  DS_GOOGLE_ANALYTICS: ["/data-sources/google-analytics-setup", "目录：如何设置Google Analytics"],
  DS_AXIBASETSD: ["/data-sources/axibase-time-series-database", "目录：如何设置Axibase时间系列数据库"],
  DS_RESULTS: ["/user-guide/querying/query-results-data-source", "目录：如何设置查询结果运算数据源"],
  ALERT_SETUP: ["/user-guide/alerts/setting-up-an-alert", "目录：如何设置提醒"],
  MAIL_CONFIG: ["/open-source/setup/#Mail-Configuration", "目录：配置邮件服务器"],
  ALERT_NOTIF_TEMPLATE_GUIDE: ["/user-guide/alerts/custom-alert-notifications", "目录：自定义提醒通知"],
  FAVORITES: ["/user-guide/querying/favorites-tagging/#Favorites", "目录：关注"],
  MANAGE_PERMISSIONS: [
    "/user-guide/querying/writing-queries#Managing-Query-Permissions",
    "目录：设置查询权限",
  ],
  NUMBER_FORMAT_SPECS: ["/user-guide/visualizations/formatting-numbers", "数字格式化显示"],
};

export default class HelpTrigger extends React.Component {
  static propTypes = {
    type: PropTypes.oneOf(Object.keys(TYPES)),
    href: PropTypes.string,
    title: PropTypes.node,
    className: PropTypes.string,
    showTooltip: PropTypes.bool,
    children: PropTypes.node,
  };

  static defaultProps = {
    type: null,
    href: null,
    title: null,
    className: null,
    showTooltip: true,
    children: <i className="fa fa-question-circle" />,
  };

  iframeRef = React.createRef();

  iframeLoadingTimeout = null;

  state = {
    visible: false,
    loading: false,
    error: false,
    currentUrl: null,
  };

  componentDidMount() {
    window.addEventListener("message", this.onPostMessageReceived, false);
  }

  componentWillUnmount() {
    window.removeEventListener("message", this.onPostMessageReceived);
    clearTimeout(this.iframeLoadingTimeout);
  }

  loadIframe = url => {
    clearTimeout(this.iframeLoadingTimeout);
    this.setState({ loading: true, error: false });

    this.iframeRef.current.src = url;
    this.iframeLoadingTimeout = setTimeout(() => {
      this.setState({ error: url, loading: false });
    }, IFRAME_TIMEOUT); // safety
  };

  onIframeLoaded = () => {
    this.setState({ loading: false });
    clearTimeout(this.iframeLoadingTimeout);
  };

  onPostMessageReceived = event => {
    if (!startsWith(event.origin, DOMAIN)) {
      return;
    }

    const { type, message: currentUrl } = event.data || {};
    if (type !== IFRAME_URL_UPDATE_MESSAGE) {
      return;
    }

    this.setState({ currentUrl });
  };

  getUrl = () => {
    const helpTriggerType = get(TYPES, this.props.type);
    return helpTriggerType ? DOMAIN + HELP_PATH + helpTriggerType[0] : this.props.href;
  };

  openDrawer = () => {
    this.setState({ visible: true });
    // wait for drawer animation to complete so there's no animation jank
    setTimeout(() => this.loadIframe(this.getUrl()), 300);
  };

  closeDrawer = event => {
    if (event) {
      event.preventDefault();
    }
    this.setState({ visible: false });
    this.setState({ visible: false, currentUrl: null });
  };

  render() {
    const tooltip = get(TYPES, `${this.props.type}[1]`, this.props.title);
    const className = cx("help-trigger", this.props.className);
    const url = this.state.currentUrl;

    const isAllowedDomain = startsWith(url || this.getUrl(), DOMAIN);

    return (
      <React.Fragment>
        <Tooltip
          title={
            this.props.showTooltip ? (
              <>
                {tooltip}
                {!isAllowedDomain && <i className="fa fa-external-link" style={{ marginLeft: 5 }} />}
              </>
            ) : null
          }>
          {isAllowedDomain ? (
            <a onClick={this.openDrawer} className={className}>
              {this.props.children}
            </a>
          ) : (
            <a href={url || this.getUrl()} className={className} rel="noopener noreferrer" target="_blank">
              {this.props.children}
            </a>
          )}
        </Tooltip>
        <Drawer
          placement="right"
          closable={false}
          onClose={this.closeDrawer}
          visible={this.state.visible}
          className="help-drawer"
          destroyOnClose
          width={400}>
          <div className="drawer-wrapper">
            <div className="drawer-menu">
              {url && (
                <Tooltip title="在新窗口打开" placement="left">
                  {/* eslint-disable-next-line react/jsx-no-target-blank */}
                  <a href={url} target="_blank">
                    <i className="fa fa-external-link" />
                  </a>
                </Tooltip>
              )}
              <Tooltip title="关闭" placement="bottom">
                <a onClick={this.closeDrawer}>
                  <Icon type="close" />
                </a>
              </Tooltip>
            </div>

            {/* iframe */}
            {!this.state.error && (
              <iframe
                ref={this.iframeRef}
                title="Redash Help"
                src="about:blank"
                className={cx({ ready: !this.state.loading })}
                onLoad={this.onIframeLoaded}
              />
            )}

            {/* loading indicator */}
            {this.state.loading && (
              <BigMessage icon="fa-spinner fa-2x fa-pulse" message="Loading..." className="help-message" />
            )}

            {/* error message */}
            {this.state.error && (
              <BigMessage icon="fa-exclamation-circle" className="help-message">
                系统出错
                <br />
                {/* eslint-disable-next-line react/jsx-no-target-blank */}
                <a href={this.state.error} target="_blank" rel="noopener">
                  点击
                </a>{" "}
                在新窗口打开。
              </BigMessage>
            )}
          </div>

          {/* extra content */}
          <DynamicComponent name="HelpDrawerExtraContent" onLeave={this.closeDrawer} openPageUrl={this.loadIframe} />
        </Drawer>
      </React.Fragment>
    );
  }
}
