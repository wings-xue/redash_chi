import React, { useState } from "react";
import Card from "antd/lib/card";
import Button from "antd/lib/button";
import Typography from "antd/lib/typography";
import { clientConfig } from "@/services/auth";
import HelpTrigger from "@/components/HelpTrigger";
import DynamicComponent from "@/components/DynamicComponent";
import OrgSettings from "@/services/organizationSettings";

const Text = Typography.Text;

function BeaconConsent() {
  const [hide, setHide] = useState(false);

  if (!clientConfig.showBeaconConsentMessage || hide) {
    return null;
  }

  const hideConsentCard = () => {
    clientConfig.showBeaconConsentMessage = false;
    setHide(true);
  };

  const confirmConsent = confirm => {
    let message = "🙏 谢谢！";

    if (!confirm) {
      message = "设置保存成功！";
    }

    OrgSettings.save({ beacon_consent: confirm }, message)
      // .then(() => {
      //   // const settings = get(response, 'settings');
      //   // this.setState({ settings, formValues: { ...settings } });
      // })
      .finally(hideConsentCard);
  };

  return (
    <DynamicComponent name="BeaconConsent">
      <div className="m-t-10 tiled">
        <Card
          title={
            <>
              你愿意以匿名的方式把使用统计数据共享给Redash团队吗?{" "}
              <HelpTrigger type="USAGE_DATA_SHARING" />
            </>
          }
          bordered={false}>
          <Text>自动发送使用统计数据，帮助Redash完善产品：</Text>
          <div className="m-t-5">
            <ul>
              <li> 用户数量，查询数，报表数，提醒数，部件和视图数</li>
              <li> 数据源类型，提醒和视图设置。</li>
            </ul>
          </div>
          <Text>所有发送数据都是统计数，绝不包含敏感和私有数据。</Text>
          <div className="m-t-5">
            <Button type="primary" className="m-r-5" onClick={() => confirmConsent(true)}>
              同意
            </Button>
            <Button type="default" onClick={() => confirmConsent(false)}>
              拒绝
            </Button>
          </div>
          <div className="m-t-15">
            <Text type="secondary">
              你随时可以进入 <a href="settings/organization">系统设置</a>{" "}
              页，更改这项配置。
            </Text>
          </div>
        </Card>
      </div>
    </DynamicComponent>
  );
}

export default BeaconConsent;
