import { extend } from "lodash";
import React, { useCallback } from "react";
import Modal from "antd/lib/modal";
import { Query } from "@/services/query";
import notification from "@/services/notification";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";

function confirmArchive() {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      title: "归档查询",
      content: (
        <React.Fragment>
          <div className="m-b-5">确定要归档查询？</div>
          <div>查询归档后，所有和该查询以及视图关联的报表部件和提醒都将删除。</div>
        </React.Fragment>
      ),
      okText: "归档",
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

function doArchiveQuery(query) {
  return Query.delete({ id: query.id })
    .then(() => {
      return extend(query.clone(), { is_archived: true, schedule: null });
    })
    .catch(error => {
      notification.error("查询未能归档。");
      return Promise.reject(error);
    });
}

export default function useArchiveQuery(query, onChange) {
  const handleChange = useImmutableCallback(onChange);

  return useCallback(() => {
    confirmArchive()
      .then(() => doArchiveQuery(query))
      .then(handleChange);
  }, [query, handleChange]);
}
