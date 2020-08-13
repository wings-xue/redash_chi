import { includes, words, capitalize, clone, isNull } from "lodash";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Checkbox from "antd/lib/checkbox";
import Modal from "antd/lib/modal";
import Form from "antd/lib/form";
import Button from "antd/lib/button";
import Select from "antd/lib/select";
import Input from "antd/lib/input";
import Divider from "antd/lib/divider";
import { wrap as wrapDialog, DialogPropType } from "@/components/DialogWrapper";
import QuerySelector from "@/components/QuerySelector";
import { Query } from "@/services/query";

const { Option } = Select;
const formItemProps = { labelCol: { span: 6 }, wrapperCol: { span: 16 } };

function getDefaultTitle(text) {
  return capitalize(words(text).join(" ")); // humanize
}

function isTypeDateRange(type) {
  return /-range/.test(type);
}

function joinExampleList(multiValuesOptions) {
  const { prefix, suffix } = multiValuesOptions;
  return ["值1", "值2", "值3"].map(value => `${prefix}${value}${suffix}`).join(",");
}

function NameInput({ name, type, onChange, existingNames, setValidation }) {
  let helpText = "";
  let validateStatus = "";

  if (!name) {
    helpText = "参数名称";
    setValidation(false);
  } else if (includes(existingNames, name)) {
    helpText = "同名参数已存在！";
    setValidation(false);
    validateStatus = "error";
  } else {
    if (isTypeDateRange(type)) {
      helpText = (
        <React.Fragment>
          在查询中显示为{" "}
          <code style={{ display: "inline-block", color: "inherit" }}>{`{{${name}.start}} {{${name}.end}}`}</code>
        </React.Fragment>
      );
    }
    setValidation(true);
  }

  return (
    <Form.Item required label="名称" help={helpText} validateStatus={validateStatus} {...formItemProps}>
      <Input onChange={e => onChange(e.target.value)} autoFocus />
    </Form.Item>
  );
}

NameInput.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  existingNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  setValidation: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
};

function EditParameterSettingsDialog(props) {
  const [param, setParam] = useState(clone(props.parameter));
  const [isNameValid, setIsNameValid] = useState(true);
  const [initialQuery, setInitialQuery] = useState();

  const isNew = !props.parameter.name;

  // fetch query by id
  useEffect(() => {
    const queryId = props.parameter.queryId;
    if (queryId) {
      Query.get({ id: queryId }).then(setInitialQuery);
    }
  }, [props.parameter.queryId]);

  function isFulfilled() {
    // name
    if (!isNameValid) {
      return false;
    }

    // title
    if (param.title === "") {
      return false;
    }

    // query
    if (param.type === "query" && !param.queryId) {
      return false;
    }

    return true;
  }

  function onConfirm(e) {
    // update title to default
    if (!param.title) {
      // forced to do this cause param won't update in time for save
      param.title = getDefaultTitle(param.name);
      setParam(param);
    }

    props.dialog.close(param);

    e.preventDefault(); // stops form redirect
  }

  return (
    <Modal
      {...props.dialog.props}
      title={isNew ? "新增参数" : param.name}
      width={600}
      footer={[
        <Button key="cancel" onClick={props.dialog.dismiss}>
          取消
        </Button>,
        <Button
          key="submit"
          htmlType="submit"
          disabled={!isFulfilled()}
          type="primary"
          form="paramForm"
          data-test="SaveParameterSettings">
          {isNew ? "新增参数" : "确定"}
        </Button>,
      ]}>
      <Form layout="horizontal" onSubmit={onConfirm} id="paramForm">
        {isNew && (
          <NameInput
            name={param.name}
            onChange={name => setParam({ ...param, name })}
            setValidation={setIsNameValid}
            existingNames={props.existingParams}
            type={param.type}
          />
        )}
        <Form.Item label="标题" {...formItemProps}>
          <Input
            value={isNull(param.title) ? getDefaultTitle(param.name) : param.title}
            onChange={e => setParam({ ...param, title: e.target.value })}
            data-test="ParameterTitleInput"
          />
        </Form.Item>
        <Form.Item label="类型" {...formItemProps}>
          <Select value={param.type} onChange={type => setParam({ ...param, type })} data-test="ParameterTypeSelect">
            <Option value="text" data-test="TextParameterTypeOption">
              文本
            </Option>
            <Option value="number" data-test="NumberParameterTypeOption">
              数字
            </Option>
            <Option value="enum">选择</Option>
            <Option value="query">查询结果</Option>
            <Option disabled key="dv1">
              <Divider className="select-option-divider" />
            </Option>
            <Option value="date" data-test="DateParameterTypeOption">
              日期(天)
            </Option>
            <Option value="datetime-local" data-test="DateTimeParameterTypeOption">
              日期(时分)
            </Option>
            <Option value="datetime-with-seconds">日期(时分秒)</Option>
            <Option disabled key="dv2">
              <Divider className="select-option-divider" />
            </Option>
            <Option value="date-range" data-test="DateRangeParameterTypeOption">
              日期范围(天)
            </Option>
            <Option value="datetime-range">日期范围(时分)</Option>
            <Option value="datetime-range-with-seconds">日期范围(时分秒)</Option>
          </Select>
        </Form.Item>
        {param.type === "enum" && (
          <Form.Item label="待选值" help="待选值(每行一个)" {...formItemProps}>
            <Input.TextArea
              rows={3}
              value={param.enumOptions}
              onChange={e => setParam({ ...param, enumOptions: e.target.value })}
            />
          </Form.Item>
        )}
        {param.type === "query" && (
          <Form.Item label="查询结果" help="待选值来自查询" {...formItemProps}>
            <QuerySelector
              selectedQuery={initialQuery}
              onChange={q => setParam({ ...param, queryId: q && q.id })}
              type="select"
            />
          </Form.Item>
        )}
        {(param.type === "enum" || param.type === "query") && (
          <Form.Item className="m-b-0" label=" " colon={false} {...formItemProps}>
            <Checkbox
              defaultChecked={!!param.multiValuesOptions}
              onChange={e =>
                setParam({
                  ...param,
                  multiValuesOptions: e.target.checked
                    ? {
                        prefix: "",
                        suffix: "",
                        separator: ",",
                      }
                    : null,
                })
              }
              data-test="AllowMultipleValuesCheckbox">
              允许多选
            </Checkbox>
          </Form.Item>
        )}
        {(param.type === "enum" || param.type === "query") && param.multiValuesOptions && (
          <Form.Item
            label="Quotation"
            help={
              <React.Fragment>
                在查询脚本中显示为: <code>{joinExampleList(param.multiValuesOptions)}</code>
              </React.Fragment>
            }
            {...formItemProps}>
            <Select
              value={param.multiValuesOptions.prefix}
              onChange={quoteOption =>
                setParam({
                  ...param,
                  multiValuesOptions: {
                    ...param.multiValuesOptions,
                    prefix: quoteOption,
                    suffix: quoteOption,
                  },
                })
              }
              data-test="QuotationSelect">
              <Option value="">无引号(默认)</Option>
              <Option value="'">单引号</Option>
              <Option value={'"'} data-test="DoubleQuotationMarkOption">
                双引号
              </Option>
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}

EditParameterSettingsDialog.propTypes = {
  parameter: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  dialog: DialogPropType.isRequired,
  existingParams: PropTypes.arrayOf(PropTypes.string),
};

EditParameterSettingsDialog.defaultProps = {
  existingParams: [],
};

export default wrapDialog(EditParameterSettingsDialog);
