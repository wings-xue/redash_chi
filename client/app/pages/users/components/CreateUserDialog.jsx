import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Modal from "antd/lib/modal";
import Alert from "antd/lib/alert";
import DynamicForm from "@/components/dynamic-form/DynamicForm";
import { wrap as wrapDialog, DialogPropType } from "@/components/DialogWrapper";
import recordEvent from "@/services/recordEvent";

function CreateUserDialog({ dialog }) {
  const [error, setError] = useState(null);
  const formRef = useRef();

  useEffect(() => {
    recordEvent("view", "page", "users/new");
  }, []);

  const createUser = useCallback(() => {
    if (formRef.current) {
      formRef.current.validateFieldsAndScroll((err, values) => {
        if (!err) {
          dialog.close(values).catch(setError);
        }
      });
    }
  }, [dialog]);

  const formFields = useMemo(() => {
    const common = { required: true, props: { onPressEnter: createUser } };
    return [
      { ...common, name: "name", title: "姓名", type: "text", autoFocus: true },
      { ...common, name: "email", title: "电子邮箱", type: "email" },
    ];
  }, [createUser]);

  return (
    <Modal {...dialog.props} title="新建用户" okText="创建" cancelText="取消" onOk={createUser}>
      <DynamicForm fields={formFields} ref={formRef} hideSubmitButton />
      {error && <Alert message={error.message} type="error" showIcon />}
    </Modal>
  );
}

CreateUserDialog.propTypes = {
  dialog: DialogPropType.isRequired,
};

export default wrapDialog(CreateUserDialog);
