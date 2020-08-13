import React from "react";
import Form from "antd/lib/form";
import HelpTrigger from "@/components/HelpTrigger";
import Checkbox from "antd/lib/checkbox";
import DynamicComponent from "@/components/DynamicComponent";
import { SettingsEditorPropTypes, SettingsEditorDefaultProps } from "../prop-types";

export default function BeaconConsentSettings(props) {
  const { values, onChange } = props;

  return (
    <DynamicComponent name="OrganizationSettings.BeaconConsentSettings" {...props}>
      <Form.Item
        label={
          <>
            匿名共享使用统计数据 <HelpTrigger type="USAGE_DATA_SHARING" />
          </>
        }>
        <Checkbox
          name="beacon_consent"
          checked={values.beacon_consent}
          onChange={e => onChange({ beacon_consent: e.target.checked })}>
          自动发送使用统计数据，帮助Redash完善产品
        </Checkbox>
      </Form.Item>
    </DynamicComponent>
  );
}

BeaconConsentSettings.propTypes = SettingsEditorPropTypes;

BeaconConsentSettings.defaultProps = SettingsEditorDefaultProps;
