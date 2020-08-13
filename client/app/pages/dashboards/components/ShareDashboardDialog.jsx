import { replace } from "lodash";
import React from "react";
import { axios } from "@/services/axios";
import PropTypes from "prop-types";
import Switch from "antd/lib/switch";
import Modal from "antd/lib/modal";
import Form from "antd/lib/form";
import Alert from "antd/lib/alert";
import notification from "@/services/notification";
import { wrap as wrapDialog, DialogPropType } from "@/components/DialogWrapper";
import InputWithCopy from "@/components/InputWithCopy";
import HelpTrigger from "@/components/HelpTrigger";

const API_SHARE_URL = "api/dashboards/{id}/share";

class ShareDashboardDialog extends React.Component {
  static propTypes = {
    dashboard: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    hasOnlySafeQueries: PropTypes.bool.isRequired,
    dialog: DialogPropType.isRequired,
  };

  formItemProps = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
    style: { marginBottom: 7 },
  };

  constructor(props) {
    super(props);
    const { dashboard } = this.props;

    this.state = {
      saving: false,
    };

    this.apiUrl = replace(API_SHARE_URL, "{id}", dashboard.id);
    this.enabled = this.props.hasOnlySafeQueries || dashboard.publicAccessEnabled;
  }

  static get headerContent() {
    return (
      <React.Fragment>
        共享报表
        <div className="modal-header-desc">
          报表将发布至一个公共网址，请将网址发送给所有要共享的人。<HelpTrigger type="SHARE_DASHBOARD" />
        </div>
      </React.Fragment>
    );
  }

  enableAccess = () => {
    const { dashboard } = this.props;
    this.setState({ saving: true });

    axios
      .post(this.apiUrl)
      .then(data => {
        dashboard.publicAccessEnabled = true;
        dashboard.public_url = data.public_url;
      })
      .catch(() => {
        notification.error("打开报表共享失败。");
      })
      .finally(() => {
        this.setState({ saving: false });
      });
  };

  disableAccess = () => {
    const { dashboard } = this.props;
    this.setState({ saving: true });

    axios
      .delete(this.apiUrl)
      .then(() => {
        dashboard.publicAccessEnabled = false;
        delete dashboard.public_url;
      })
      .catch(() => {
        notification.error("关闭报表共享失败。");
      })
      .finally(() => {
        this.setState({ saving: false });
      });
  };

  onChange = checked => {
    if (checked) {
      this.enableAccess();
    } else {
      this.disableAccess();
    }
  };

  render() {
    const { dialog, dashboard } = this.props;

    return (
      <Modal {...dialog.props} title={this.constructor.headerContent} footer={null}>
        <Form layout="horizontal">
          {!this.props.hasOnlySafeQueries && (
            <Form.Item>
              <Alert
                message="不能共享包含文本参数类型的报表，请改为其它参数类型。"
                type="error"
              />
            </Form.Item>
          )}
          <Form.Item label="允许所有人查看" {...this.formItemProps}>
            <Switch
              checked={dashboard.publicAccessEnabled}
              onChange={this.onChange}
              loading={this.state.saving}
              disabled={!this.enabled}
              data-test="PublicAccessEnabled"
            />
          </Form.Item>
          {dashboard.public_url && (
            <Form.Item label="私密网址" {...this.formItemProps}>
              <InputWithCopy value={dashboard.public_url} data-test="SecretAddress" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    );
  }
}

export default wrapDialog(ShareDashboardDialog);
