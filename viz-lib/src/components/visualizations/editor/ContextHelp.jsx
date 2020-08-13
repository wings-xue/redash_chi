import React from "react";
import PropTypes from "prop-types";
import Popover from "antd/lib/popover";
import Icon from "antd/lib/icon";
import { visualizationsSettings } from "@/visualizations/visualizationsSettings";

import "./context-help.less";

export default function ContextHelp({ icon, children, ...props }) {
  return (
    <Popover {...props} content={children}>
      {icon || ContextHelp.defaultIcon}
    </Popover>
  );
}

ContextHelp.propTypes = {
  icon: PropTypes.node,
  children: PropTypes.node,
};

ContextHelp.defaultProps = {
  icon: null,
  children: null,
};

ContextHelp.defaultIcon = <Icon className="context-help-default-icon" type="question-circle" theme="filled" />;

function NumberFormatSpecs() {
  const { HelpTriggerComponent } = visualizationsSettings;
  return (
    <HelpTriggerComponent
      title="格式化数字"
      href="https://redash.io/help/user-guide/visualizations/formatting-numbers"
      className="visualization-editor-context-help">
      {ContextHelp.defaultIcon}
    </HelpTriggerComponent>
  );
}

function DateTimeFormatSpecs() {
  const { HelpTriggerComponent } = visualizationsSettings;
  return (
    <HelpTriggerComponent
      title="格式化日期和时间"
      href="https://momentjs.com/docs/#/displaying/format/"
      className="visualization-editor-context-help">
      {ContextHelp.defaultIcon}
    </HelpTriggerComponent>
  );
}

ContextHelp.NumberFormatSpecs = NumberFormatSpecs;
ContextHelp.DateTimeFormatSpecs = DateTimeFormatSpecs;
