import React, { useCallback } from "react";
import Tooltip from "antd/lib/tooltip";
import Button from "antd/lib/button";
import PropTypes from "prop-types";
import "@/redash-font/style.less";
import recordEvent from "@/services/recordEvent";

export default function AutocompleteToggle({ available, enabled, onToggle }) {
  let tooltipMessage = "启用自动填充";
  let icon = "icon-flash";
  if (!enabled) {
    tooltipMessage = "禁用自动填充";
    icon = "icon-flash-off";
  }

  if (!available) {
    tooltipMessage = "自动填充已禁用 (按 Ctrl+空格 键启用)";
    icon = "icon-flash-off";
  }

  const handleClick = useCallback(() => {
    recordEvent("toggle_autocomplete", "screen", "query_editor", { state: !enabled });
    onToggle(!enabled);
  }, [enabled, onToggle]);

  return (
    <Tooltip placement="top" title={tooltipMessage}>
      <Button className="query-editor-controls-button m-r-5" disabled={!available} onClick={handleClick}>
        <i className={"icon " + icon} />
      </Button>
    </Tooltip>
  );
}

AutocompleteToggle.propTypes = {
  available: PropTypes.bool.isRequired,
  enabled: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};
