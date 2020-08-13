import React from "react";
import Alert from "antd/lib/alert";
import Form from "antd/lib/form";
import Checkbox from "antd/lib/checkbox";
import Tooltip from "antd/lib/tooltip";
import DynamicComponent from "@/components/DynamicComponent";
import { clientConfig } from "@/services/auth";
import { SettingsEditorPropTypes, SettingsEditorDefaultProps } from "../prop-types";

export default function PasswordLoginSettings(props) {
  const { settings, values, onChange } = props;

  const isTheOnlyAuthMethod =
    !clientConfig.googleLoginEnabled && !clientConfig.ldapLoginEnabled && !values.auth_saml_enabled;

  return (
    <DynamicComponent name="OrganizationSettings.PasswordLoginSettings" {...props}>
      {!settings.auth_password_login_enabled && (
        <Alert
          message="用户名密码登陆方式已禁用，仅支持SSO集成认证方式登陆。"
          type="warning"
          className="m-t-15 m-b-15"
        />
      )}
      <Form.Item>
        <Checkbox
          checked={values.auth_password_login_enabled}
          disabled={isTheOnlyAuthMethod}
          onChange={e => onChange({ auth_password_login_enabled: e.target.checked })}>
          <Tooltip
            title={
              isTheOnlyAuthMethod ? "只有用户启用了其它登陆认证，才可以取消用户名密码登陆方式。" : null
            }
            placement="right">
            启用用户名密码登陆方式
          </Tooltip>
        </Checkbox>
      </Form.Item>
    </DynamicComponent>
  );
}

PasswordLoginSettings.propTypes = SettingsEditorPropTypes;

PasswordLoginSettings.defaultProps = SettingsEditorDefaultProps;
