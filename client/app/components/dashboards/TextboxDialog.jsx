import { toString } from "lodash";
import { markdown } from "markdown";
import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useDebouncedCallback } from "use-debounce";
import Modal from "antd/lib/modal";
import Input from "antd/lib/input";
import Tooltip from "antd/lib/tooltip";
import Divider from "antd/lib/divider";
import HtmlContent from "@redash/viz/lib/components/HtmlContent";
import { wrap as wrapDialog, DialogPropType } from "@/components/DialogWrapper";
import notification from "@/services/notification";

import "./TextboxDialog.less";

function TextboxDialog({ dialog, isNew, ...props }) {
  const [text, setText] = useState(toString(props.text));
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    setText(props.text);
    setPreview(markdown.toHTML(props.text));
  }, [props.text]);

  const [updatePreview] = useDebouncedCallback(() => {
    setPreview(markdown.toHTML(text));
  }, 200);

  const handleInputChange = useCallback(
    event => {
      setText(event.target.value);
      updatePreview();
    },
    [updatePreview]
  );

  const saveWidget = useCallback(() => {
    dialog.close(text).catch(() => {
      notification.error(isNew ? "部件将不会新增。" : "部件将不会保存。");
    });
  }, [dialog, isNew, text]);

  const confirmDialogDismiss = useCallback(() => {
    const originalText = props.text;
    if (text !== originalText) {
      Modal.confirm({
        title: "退出编辑?",
        content: "更改内容将不会保存，确定退出吗?",
        okText: "不保存退出",
        cancelText: "取消",
        okType: "danger",
        onOk: () => dialog.dismiss(),
        maskClosable: true,
        autoFocusButton: null,
        style: { top: 170 },
      });
    } else {
      dialog.dismiss();
    }
  }, [dialog, text, props.text]);

  return (
    <Modal
      {...dialog.props}
      title={isNew ? "新增文本" : "编辑文本"}
      onOk={saveWidget}
      okText={isNew ? "添加至报表" : "保存"}
      cancelText="取消"
      onCancel={confirmDialogDismiss}
      width={500}
      wrapProps={{ "data-test": "TextboxDialog" }}>
      <div className="textbox-dialog">
        <Input.TextArea
          className="resize-vertical"
          rows="5"
          value={text}
          onChange={handleInputChange}
          autoFocus
          placeholder="请输入文本"
        />
        <small>
          支持基本的{" "}{" "}
          <a target="_blank" rel="noopener noreferrer" href="https://www.markdownguide.org/cheat-sheet/#basic-syntax">
            <Tooltip title="在新窗口打开Markdown标记指南">Markdown标记(英文)</Tooltip>
          </a>
          ；
          <a target="_blank" rel="noopener noreferrer" href="https://www.runoob.com/markdown/md-tutorial.html">
            <Tooltip title="在新窗口打开Markdown菜鸟教程">Markdown菜鸟教程(中文)</Tooltip>
          </a>
          。
        </small>
        {text && (
          <React.Fragment>
            <Divider dashed />
            <strong className="preview-title">预览：</strong>
            <HtmlContent className="preview markdown">{preview}</HtmlContent>
          </React.Fragment>
        )}
      </div>
    </Modal>
  );
}

TextboxDialog.propTypes = {
  dialog: DialogPropType.isRequired,
  isNew: PropTypes.bool,
  text: PropTypes.string,
};

TextboxDialog.defaultProps = {
  isNew: false,
  text: "",
};

export default wrapDialog(TextboxDialog);
