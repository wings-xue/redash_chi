import { isNil, isObject, extend, keys, map, omit, pick, uniq, get } from "lodash";
import React, { useCallback } from "react";
import Modal from "antd/lib/modal";
import { Query } from "@/services/query";
import notification from "@/services/notification";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";

class SaveQueryError extends Error {
  constructor(message, detailedMessage = null) {
    super(message);
    this.detailedMessage = detailedMessage;
  }
}

class SaveQueryConflictError extends SaveQueryError {
  constructor() {
    super(
      "变更未能保存",
      <React.Fragment>
        <div className="m-b-5">查询已被其它用户改变。</div>
        <div>请自行复制保存变更，重新加载后再维护。</div>
      </React.Fragment>
    );
  }
}

function confirmOverwrite() {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      title: "覆盖查询",
      content: (
        <React.Fragment>
          <div className="m-b-5">查询已被其它用户改变。</div>
          <div>确定要覆盖查询吗？</div>
        </React.Fragment>
      ),
      okText: "覆盖",
      cancelText: "取消",
      okType: "danger",
      onOk: () => {
        resolve();
      },
      onCancel: () => {
        reject();
      },
      maskClosable: true,
      autoFocusButton: null,
    });
  });
}

function doSaveQuery(data, { canOverwrite = false } = {}) {
  // omit parameter properties that don't need to be stored
  if (isObject(data.options) && data.options.parameters) {
    data.options = {
      ...data.options,
      parameters: map(data.options.parameters, p => p.toSaveableObject()),
    };
  }

  return Query.save(data).catch(error => {
    if (get(error, "response.status") === 409) {
      if (canOverwrite) {
        return confirmOverwrite()
          .then(() => Query.save(omit(data, ["version"])))
          .catch(() => Promise.reject(new SaveQueryConflictError()));
      }
      return Promise.reject(new SaveQueryConflictError());
    }
    return Promise.reject(new SaveQueryError("查询未能保存。"));
  });
}

export default function useUpdateQuery(query, onChange) {
  const handleChange = useImmutableCallback(onChange);

  return useCallback(
    (data = null, { successMessage = "查询保存成功！" } = {}) => {
      if (isObject(data)) {
        // Don't save new query with partial data
        if (query.isNew()) {
          handleChange(extend(query.clone(), data));
          return;
        }
        data = { ...data, id: query.id, version: query.version };
      } else {
        data = pick(query, [
          "id",
          "version",
          "schedule",
          "query",
          "description",
          "name",
          "data_source_id",
          "options",
          "latest_query_data_id",
          "is_draft",
        ]);
      }

      return doSaveQuery(data, { canOverwrite: query.can_edit })
        .then(updatedQuery => {
          if (!isNil(successMessage)) {
            notification.success(successMessage);
          }
          handleChange(
            extend(
              query.clone(),
              // if server returned completely new object (currently possible only when saving new query) -
              // update all fields; otherwise pick only changed fields
              updatedQuery.id !== query.id ? updatedQuery : pick(updatedQuery, uniq(["id", "version", ...keys(data)]))
            )
          );
        })
        .catch(error => {
          const notificationOptions = {};
          if (error instanceof SaveQueryConflictError) {
            notificationOptions.duration = null;
          }
          notification.error(error.message, error.detailedMessage, notificationOptions);
        });
    },
    [query, handleChange]
  );
}
