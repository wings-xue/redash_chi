import { first } from "lodash";
import React, { useState } from "react";
import Button from "antd/lib/button";
import Menu from "antd/lib/menu";
import Icon from "antd/lib/icon";
import HelpTrigger from "@/components/HelpTrigger";
import CreateDashboardDialog from "@/components/dashboards/CreateDashboardDialog";
import { Auth, currentUser } from "@/services/auth";
import settingsMenu from "@/services/settingsMenu";
import logoUrl from "@/assets/images/redash_icon_small.png";

import VersionInfo from "./VersionInfo";
import "./DesktopNavbar.less";

function NavbarSection({ inlineCollapsed, children, ...props }) {
  return (
    <Menu
      selectable={false}
      mode={inlineCollapsed ? "inline" : "vertical"}
      inlineCollapsed={inlineCollapsed}
      theme="dark"
      {...props}>
      {children}
    </Menu>
  );
}

export default function DesktopNavbar() {
  const [collapsed, setCollapsed] = useState(true);

  const firstSettingsTab = first(settingsMenu.getAvailableItems());

  const canCreateQuery = currentUser.hasPermission("create_query");
  const canCreateDashboard = currentUser.hasPermission("create_dashboard");
  const canCreateAlert = currentUser.hasPermission("list_alerts");

  return (
    <div className="desktop-navbar">
      <NavbarSection inlineCollapsed={collapsed} className="desktop-navbar-logo">
        <a href="./">
          <img src={logoUrl} alt="Redash" />
        </a>
      </NavbarSection>

      <NavbarSection inlineCollapsed={collapsed}>
        {currentUser.hasPermission("list_dashboards") && (
          <Menu.Item key="dashboards">
            <a href="dashboards">
              <Icon type="desktop" />
              <span>报表</span>
            </a>
          </Menu.Item>
        )}
        {currentUser.hasPermission("view_query") && (
          <Menu.Item key="queries">
            <a href="queries">
              <Icon type="code" />
              <span>查询</span>
            </a>
          </Menu.Item>
        )}
        {currentUser.hasPermission("list_alerts") && (
          <Menu.Item key="alerts">
            <a href="alerts">
              <Icon type="alert" />
              <span>提醒</span>
            </a>
          </Menu.Item>
        )}
      </NavbarSection>

      <NavbarSection inlineCollapsed={collapsed} className="desktop-navbar-spacer">
        {(canCreateQuery || canCreateDashboard || canCreateAlert) && <Menu.Divider />}
        {(canCreateQuery || canCreateDashboard || canCreateAlert) && (
          <Menu.SubMenu
            key="create"
            popupClassName="desktop-navbar-submenu"
            title={
              <React.Fragment>
                <span data-test="CreateButton">
                  <Icon type="plus" />
                  <span>新建</span>
                </span>
              </React.Fragment>
            }>
            {canCreateQuery && (
              <Menu.Item key="new-query">
                <a href="queries/new" data-test="CreateQueryMenuItem">
                  新建查询
                </a>
              </Menu.Item>
            )}
            {canCreateDashboard && (
              <Menu.Item key="new-dashboard">
                <a data-test="CreateDashboardMenuItem" onMouseUp={() => CreateDashboardDialog.showModal()}>
                  新建报表
                </a>
              </Menu.Item>
            )}
            {canCreateAlert && (
              <Menu.Item key="new-alert">
                <a data-test="CreateAlertMenuItem" href="alerts/new">
                  新建提醒
                </a>
              </Menu.Item>
            )}
          </Menu.SubMenu>
        )}
      </NavbarSection>

      <NavbarSection inlineCollapsed={collapsed}>
        <Menu.Item key="help">
          <HelpTrigger showTooltip={false} type="HOME">
            <Icon type="question-circle" />
            <span>帮助</span>
          </HelpTrigger>
        </Menu.Item>
        {firstSettingsTab && (
          <Menu.Item key="settings">
            <a href={firstSettingsTab.path} data-test="SettingsLink">
              <Icon type="setting" />
              <span>设置</span>
            </a>
          </Menu.Item>
        )}
        <Menu.Divider />
      </NavbarSection>

      <NavbarSection inlineCollapsed={collapsed} className="desktop-navbar-profile-menu">
        <Menu.SubMenu
          key="profile"
          popupClassName="desktop-navbar-submenu"
          title={
            <span data-test="ProfileDropdown" className="desktop-navbar-profile-menu-title">
              <img className="profile__image_thumb" src={currentUser.profile_image_url} alt={currentUser.name} />
              <span>{currentUser.name}</span>
            </span>
          }>
          <Menu.Item key="profile">
            <a href="users/me">个人设置</a>
          </Menu.Item>
          {currentUser.hasPermission("super_admin") && (
            <Menu.Item key="status">
              <a href="admin/status">系统状态</a>
            </Menu.Item>
          )}
          <Menu.Divider />
          <Menu.Item key="logout">
            <a data-test="LogOutButton" onClick={() => Auth.logout()}>
              退出
            </a>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="version" disabled className="version-info">
            <VersionInfo />
          </Menu.Item>
        </Menu.SubMenu>
      </NavbarSection>

      <Button onClick={() => setCollapsed(!collapsed)} className="desktop-navbar-collapse-button">
        <Icon type={collapsed ? "menu-unfold" : "menu-fold"} />
      </Button>
    </div>
  );
}
