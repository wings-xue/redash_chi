import { isObject, get } from "lodash";
import React from "react";
import PropTypes from "prop-types";

import "./ErrorMessage.less";

function getErrorMessageByStatus(status, defaultMessage) {
  switch (status) {
    case 404:
      return "网页不存在。";
    case 401:
    case 403:
      return "没有权限。";
    default:
      return defaultMessage;
  }
}

function getErrorMessage(error) {
  const message = "系统出错，请刷新重试或者联系系统管理员！";
  if (isObject(error)) {
    // HTTP errors
    if (error.isAxiosError && isObject(error.response)) {
      return getErrorMessageByStatus(error.response.status, get(error, "response.data.message", message));
    }
    // Router errors
    if (error.status) {
      return getErrorMessageByStatus(error.status, message);
    }
  }
  return message;
}

export default function ErrorMessage({ error }) {
  if (!error) {
    return null;
  }

  console.error(error);

  return (
    <div className="error-message-container" data-test="ErrorMessage">
      <div className="error-state bg-white tiled">
        <div className="error-state__icon">
          <i className="zmdi zmdi-alert-circle-o" />
        </div>
        <div className="error-state__details">
          <h4>{getErrorMessage(error)}</h4>
        </div>
      </div>
    </div>
  );
}

ErrorMessage.propTypes = {
  error: PropTypes.object.isRequired,
};
