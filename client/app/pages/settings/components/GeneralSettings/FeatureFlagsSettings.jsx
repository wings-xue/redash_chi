import React from "react";
import Checkbox from "antd/lib/checkbox";
import Form from "antd/lib/form";
import DynamicComponent from "@/components/DynamicComponent";
import { SettingsEditorPropTypes, SettingsEditorDefaultProps } from "../prop-types";

export default function FeatureFlagsSettings(props) {
  const { values, onChange } = props;

  return (
    <DynamicComponent name="OrganizationSettings.FeatureFlagsSettings" {...props}>
      <Form.Item label="特征">
        <Checkbox
          name="feature_show_permissions_control"
          checked={values.feature_show_permissions_control}
          onChange={e => onChange({ feature_show_permissions_control: e.target.checked })}>
          启用查询报表支持多拥有者模式
        </Checkbox>
      </Form.Item>
      <Form.Item>
        <Checkbox
          name="send_email_on_failed_scheduled_queries"
          checked={values.send_email_on_failed_scheduled_queries}
          onChange={e => onChange({ send_email_on_failed_scheduled_queries: e.target.checked })}>
          查询后台执行调度失败时，邮件通知创建人
        </Checkbox>
      </Form.Item>
      <Form.Item>
        <Checkbox
          name="multi_byte_search_enabled"
          checked={values.multi_byte_search_enabled}
          onChange={e => onChange({ multi_byte_search_enabled: e.target.checked })}>
          查询报表支持多字节语言检索(中、日、韩文，速度较慢)
        </Checkbox>
      </Form.Item>
    </DynamicComponent>
  );
}

FeatureFlagsSettings.propTypes = SettingsEditorPropTypes;

FeatureFlagsSettings.defaultProps = SettingsEditorDefaultProps;
