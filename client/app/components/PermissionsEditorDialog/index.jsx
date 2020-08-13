import React, { useState, useEffect, useCallback } from "react";
import { axios } from "@/services/axios";
import PropTypes from "prop-types";
import { each, debounce, get, find } from "lodash";
import Button from "antd/lib/button";
import List from "antd/lib/list";
import Modal from "antd/lib/modal";
import Select from "antd/lib/select";
import Tag from "antd/lib/tag";
import Tooltip from "antd/lib/tooltip";
import { wrap as wrapDialog, DialogPropType } from "@/components/DialogWrapper";
import { toHuman } from "@/lib/utils";
import HelpTrigger from "@/components/HelpTrigger";
import { UserPreviewCard } from "@/components/PreviewCard";
import notification from "@/services/notification";
import User from "@/services/user";

import "./index.less";

const { Option } = Select;
const DEBOUNCE_SEARCH_DURATION = 200;

function useGrantees(url) {
  const loadGrantees = useCallback(
    () =>
      axios.get(url).then(data => {
        const resultGrantees = [];
        each(data, (grantees, accessType) => {
          grantees.forEach(grantee => {
            grantee.accessType = toHuman(accessType);
            resultGrantees.push(grantee);
          });
        });
        return resultGrantees;
      }),
    [url]
  );

  const addPermission = useCallback(
    (userId, accessType = "modify") =>
      axios
        .post(url, { access_type: accessType, user_id: userId })
        .catch(() => notification.error("未能授权用户。")),
    [url]
  );

  const removePermission = useCallback(
    (userId, accessType = "modify") =>
      axios
        .delete(url, { data: { access_type: accessType, user_id: userId } })
        .catch(() => notification.error("未能移除用户。")),
    [url]
  );

  return { loadGrantees, addPermission, removePermission };
}

const searchUsers = searchTerm =>
  User.query({ q: searchTerm })
    .then(({ results }) => results)
    .catch(() => []);

function PermissionsEditorDialogHeader({ context }) {
  return (
    <>
      权限管理
      <div className="modal-header-desc">
        {`该${context}仅允许下列用户编辑：`}
        <HelpTrigger type="MANAGE_PERMISSIONS" />
      </div>
    </>
  );
}

PermissionsEditorDialogHeader.propTypes = { context: PropTypes.oneOf(["查询", "报表"]) };
PermissionsEditorDialogHeader.defaultProps = { context: "查询" };

function UserSelect({ onSelect, shouldShowUser }) {
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearchUsers = useCallback(
    debounce(
      search =>
        searchUsers(search)
          .then(setUsers)
          .finally(() => setLoadingUsers(false)),
      DEBOUNCE_SEARCH_DURATION
    ),
    []
  );

  useEffect(() => {
    setLoadingUsers(true);
    debouncedSearchUsers(searchTerm);
  }, [debouncedSearchUsers, searchTerm]);

  return (
    <Select
      className="w-100 m-b-10"
      placeholder="添加成员..."
      showSearch
      onSearch={setSearchTerm}
      suffixIcon={loadingUsers ? <i className="fa fa-spinner fa-pulse" /> : <i className="fa fa-search" />}
      filterOption={false}
      notFoundContent={null}
      value={undefined}
      getPopupContainer={trigger => trigger.parentNode}
      onSelect={onSelect}>
      {users.filter(shouldShowUser).map(user => (
        <Option key={user.id} value={user.id}>
          <UserPreviewCard user={user} />
        </Option>
      ))}
    </Select>
  );
}

UserSelect.propTypes = {
  onSelect: PropTypes.func,
  shouldShowUser: PropTypes.func,
};
UserSelect.defaultProps = { onSelect: () => {}, shouldShowUser: () => true };

function PermissionsEditorDialog({ dialog, author, context, aclUrl }) {
  const [loadingGrantees, setLoadingGrantees] = useState(true);
  const [grantees, setGrantees] = useState([]);
  const { loadGrantees, addPermission, removePermission } = useGrantees(aclUrl);
  const loadUsersWithPermissions = useCallback(() => {
    setLoadingGrantees(true);
    loadGrantees()
      .then(setGrantees)
      .catch(() => notification.error("未能加载权限列表。"))
      .finally(() => setLoadingGrantees(false));
  }, [loadGrantees]);

  const userHasPermission = useCallback(
    user => user.id === author.id || !!get(find(grantees, { id: user.id }), "accessType"),
    [author.id, grantees]
  );

  useEffect(() => {
    loadUsersWithPermissions();
  }, [aclUrl, loadUsersWithPermissions]);

  return (
    <Modal
      {...dialog.props}
      className="permissions-editor-dialog"
      title={<PermissionsEditorDialogHeader context={context} />}
      footer={<Button onClick={dialog.dismiss}>关闭</Button>}>
      <UserSelect
        onSelect={userId => addPermission(userId).then(loadUsersWithPermissions)}
        shouldShowUser={user => !userHasPermission(user)}
      />
      <div className="d-flex align-items-center m-t-5">
        <h5 className="flex-fill">用户权限</h5>
        {loadingGrantees && <i className="fa fa-spinner fa-pulse" />}
      </div>
      <div className="scrollbox p-5" style={{ maxHeight: "40vh" }}>
        <List
          size="small"
          dataSource={[author, ...grantees]}
          renderItem={user => (
            <List.Item>
              <UserPreviewCard key={user.id} user={user}>
                {user.id === author.id ? (
                  <Tag className="m-0">作者</Tag>
                ) : (
                  <Tooltip title="移除用户权限">
                    <i
                      className="fa fa-remove clickable"
                      onClick={() => removePermission(user.id).then(loadUsersWithPermissions)}
                    />
                  </Tooltip>
                )}
              </UserPreviewCard>
            </List.Item>
          )}
        />
      </div>
    </Modal>
  );
}

PermissionsEditorDialog.propTypes = {
  dialog: DialogPropType.isRequired,
  author: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  context: PropTypes.oneOf(["查询", "报表"]),
  aclUrl: PropTypes.string.isRequired,
};

PermissionsEditorDialog.defaultProps = { context: "查询" };

export default wrapDialog(PermissionsEditorDialog);
