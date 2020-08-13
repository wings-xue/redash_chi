import { isNil, get } from "lodash";
import React, { useCallback } from "react";
import PropTypes from "prop-types";
import Button from "antd/lib/button";
import Modal from "antd/lib/modal";
import DynamicForm from "@/components/dynamic-form/DynamicForm";
import { wrap as wrapDialog, DialogPropType } from "@/components/DialogWrapper";

function QuerySnippetDialog({ querySnippet, dialog, readOnly }) {
  const handleSubmit = useCallback(
    (values, successCallback, errorCallback) => {
      const querySnippetId = get(querySnippet, "id");

      if (isNil(values.description)) {
        values.description = "";
      }

      dialog
        .close(querySnippetId ? { id: querySnippetId, ...values } : values)
        .then(() => successCallback("保存成功！."))
        .catch(() => errorCallback("保存失败！"));
    },
    [dialog, querySnippet]
  );

  const isEditing = !!get(querySnippet, "id");

  const formFields = [
    { name: "trigger", title: "代码", type: "text", required: true, autoFocus: !isEditing },
    { name: "description", title: "描述", type: "text" },
    { name: "snippet", title: "查询脚本", type: "ace", required: true },
  ].map(field => ({ ...field, readOnly, initialValue: get(querySnippet, field.name, "") }));

  return (
    <Modal
      {...dialog.props}
      title={isEditing ? querySnippet.trigger : "新建查询脚本"}
      footer={[
        <Button key="cancel" {...dialog.props.cancelButtonProps} onClick={dialog.dismiss}>
          {readOnly ? "关闭" : "取消"}
        </Button>,
        !readOnly && (
          <Button
            key="submit"
            {...dialog.props.okButtonProps}
            disabled={readOnly || dialog.props.okButtonProps.disabled}
            htmlType="submit"
            type="primary"
            form="querySnippetForm"
            data-test="SaveQuerySnippetButton">
            {isEditing ? "保存" : "创建"}
          </Button>
        ),
      ]}
      wrapProps={{
        "data-test": "QuerySnippetDialog",
      }}>
      <DynamicForm id="querySnippetForm" fields={formFields} onSubmit={handleSubmit} hideSubmitButton feedbackIcons />
    </Modal>
  );
}

QuerySnippetDialog.propTypes = {
  dialog: DialogPropType.isRequired,
  querySnippet: PropTypes.object,
  readOnly: PropTypes.bool,
};

QuerySnippetDialog.defaultProps = {
  querySnippet: null,
  readOnly: false,
};

export default wrapDialog(QuerySnippetDialog);
