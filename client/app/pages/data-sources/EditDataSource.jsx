import { get, find, toUpper } from "lodash";
import React from "react";
import PropTypes from "prop-types";

import Modal from "antd/lib/modal";
import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import navigateTo from "@/components/ApplicationArea/navigateTo";
import LoadingState from "@/components/items-list/components/LoadingState";
import DynamicForm from "@/components/dynamic-form/DynamicForm";
import helper from "@/components/dynamic-form/dynamicFormHelper";
import HelpTrigger, { TYPES as HELP_TRIGGER_TYPES } from "@/components/HelpTrigger";
import wrapSettingsTab from "@/components/SettingsWrapper";

import DataSource, { IMG_ROOT } from "@/services/data-source";
import notification from "@/services/notification";
import routes from "@/services/routes";

class EditDataSource extends React.Component {
  static propTypes = {
    dataSourceId: PropTypes.string.isRequired,
    onError: PropTypes.func,
  };

  static defaultProps = {
    onError: () => {},
  };

  state = {
    dataSource: null,
    type: null,
    loading: true,
  };

  componentDidMount() {
    DataSource.get({ id: this.props.dataSourceId })
      .then(dataSource => {
        const { type } = dataSource;
        this.setState({ dataSource });
        DataSource.types().then(types => this.setState({ type: find(types, { type }), loading: false }));
      })
      .catch(error => this.props.onError(error));
  }

  saveDataSource = (values, successCallback, errorCallback) => {
    const { dataSource } = this.state;
    helper.updateTargetWithValues(dataSource, values);
    DataSource.save(dataSource)
      .then(() => successCallback("保存成功！"))
      .catch(error => {
        const message = get(error, "response.data.message", "保存失败。");
        errorCallback(message);
      });
  };

  deleteDataSource = callback => {
    const { dataSource } = this.state;

    const doDelete = () => {
      DataSource.delete(dataSource)
        .then(() => {
          notification.success("数据源删除成功！");
          navigateTo("data_sources");
        })
        .catch(() => {
          callback();
        });
    };

    Modal.confirm({
      title: "删除数据源",
      content: "确定要删除数据源吗？",
      okText: "删除",
      cancelText: "取消",
      okType: "danger",
      onOk: doDelete,
      onCancel: callback,
      maskClosable: true,
      autoFocusButton: null,
    });
  };

  testConnection = callback => {
    const { dataSource } = this.state;
    DataSource.test({ id: dataSource.id })
      .then(httpResponse => {
        if (httpResponse.ok) {
          notification.success("连接成功！");
        } else {
          notification.error("连接测试失败：", httpResponse.message, { duration: 10 });
        }
        callback();
      })
      .catch(() => {
        notification.error(
          "连接测试失败：",
          "数据源连接过程中发生错误，请重试。",
          { duration: 10 }
        );
        callback();
      });
  };

  renderForm() {
    const { dataSource, type } = this.state;
    const fields = helper.getFields(type, dataSource);
    const helpTriggerType = `DS_${toUpper(type.type)}`;
    const formProps = {
      fields,
      type,
      actions: [
        { name: "删除", type: "danger", callback: this.deleteDataSource },
        { name: "连接测试", pullRight: true, callback: this.testConnection, disableWhenDirty: true },
      ],
      onSubmit: this.saveDataSource,
      feedbackIcons: true,
      defaultShowExtraFields: helper.hasFilledExtraField(type, dataSource),
    };

    return (
      <div className="row" data-test="DataSource">
        <div className="text-right m-r-10">
          {HELP_TRIGGER_TYPES[helpTriggerType] && (
            <HelpTrigger className="f-13" type={helpTriggerType}>
              Setup Instructions <i className="fa fa-question-circle" />
            </HelpTrigger>
          )}
        </div>
        <div className="text-center m-b-10">
          <img className="p-5" src={`${IMG_ROOT}/${type.type}.png`} alt={type.name} width="64" />
          <h3 className="m-0">{type.name}</h3>
        </div>
        <div className="col-md-4 col-md-offset-4 m-b-10">
          <DynamicForm {...formProps} />
        </div>
      </div>
    );
  }

  render() {
    return this.state.loading ? <LoadingState className="" /> : this.renderForm();
  }
}

const EditDataSourcePage = wrapSettingsTab("DataSources.Edit", null, EditDataSource);

routes.register(
  "DataSources.Edit",
  routeWithUserSession({
    path: "/data_sources/:dataSourceId",
    title: "数据源",
    render: pageProps => <EditDataSourcePage {...pageProps} />,
  })
);
