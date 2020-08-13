import { isEmpty, join } from "lodash";
import React from "react";
import Form from "antd/lib/form";
import Select from "antd/lib/select";
import Alert from "antd/lib/alert";
import DynamicComponent from "@/components/DynamicComponent";
import { clientConfig } from "@/services/auth";
import { SettingsEditorPropTypes, SettingsEditorDefaultProps } from "../prop-types";

export default function GoogleLoginSettings(props) {
  const { values, onChange } = props;

  if (!clientConfig.googleLoginEnabled) {
    return null;
  }

  return (
    <DynamicComponent name="OrganizationSettings.GoogleLoginSettings" {...props}>
      <h4>集成Google账户</h4>
      <Form.Item label="允许 Google Apps Domains">
        <Select
          mode="tags"
          value={values.auth_google_apps_domains}
          onChange={value => onChange({ auth_google_apps_domains: value })}
        />
        {!isEmpty(values.auth_google_apps_domains) && (
          <Alert
            message={
              <p>
                可以用<strong>{join(values.auth_google_apps_domains, ", ")}</strong>谷歌账户注册新用户；
                没有注册而直接用谷歌账户登陆，将会自动创建一个默认角色用户。
              </p>
            }
            className="m-t-15"
          />
        )}
      </Form.Item>
    </DynamicComponent>
  );
}

GoogleLoginSettings.propTypes = SettingsEditorPropTypes;

GoogleLoginSettings.defaultProps = SettingsEditorDefaultProps;
