import { get, map } from "lodash";
import React, { useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { UserProfile } from "@/components/proptypes";
import DynamicComponent from "@/components/DynamicComponent";
import DynamicForm from "@/components/dynamic-form/DynamicForm";

import User from "@/services/user";
import { currentUser } from "@/services/auth";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";

import UserGroups from "./UserGroups";
import useUserGroups from "../hooks/useUserGroups";

export default function UserInfoForm(props) {
  const { user, onChange } = props;

  const { groups, allGroups, isLoading: isLoadingGroups } = useUserGroups(user);

  const handleChange = useImmutableCallback(onChange);

  const saveUser = useCallback(
    (values, successCallback, errorCallback) => {
      const data = {
        ...values,
        id: user.id,
      };

      User.save(data)
        .then(user => {
          successCallback("Saved.");
          handleChange(User.convertUserInfo(user));
        })
        .catch(error => {
          errorCallback(get(error, "response.data.message", "Failed saving."));
        });
    },
    [user, handleChange]
  );

  const formFields = useMemo(
    () =>
      map(
        [
          {
            name: "name",
            title: "名称",
            type: "text",
            initialValue: user.name,
          },
          {
            name: "email",
            title: "电子邮箱",
            type: "email",
            initialValue: user.email,
          },
          !user.isDisabled && currentUser.id !== user.id
            ? {
                name: "group_ids",
                title: "角色",
                type: "select",
                mode: "multiple",
                options: map(allGroups, group => ({ name: group.name, value: group.id })),
                initialValue: map(groups, group => group.id),
                loading: isLoadingGroups,
                placeholder: isLoadingGroups ? "加载中..." : "",
              }
            : {
                name: "group_ids",
                title: "角色",
                type: "content",
                content: isLoadingGroups ? "加载中..." : <UserGroups data-test="Groups" groups={groups} />,
              },
        ],
        field => ({ readOnly: user.isDisabled, required: true, ...field })
      ),
    [user, groups, allGroups, isLoadingGroups]
  );

  return (
    <DynamicComponent name="UserProfile.UserInfoForm" {...props}>
      <DynamicForm fields={formFields} onSubmit={saveUser} hideSubmitButton={user.isDisabled} />
    </DynamicComponent>
  );
}

UserInfoForm.propTypes = {
  user: UserProfile.isRequired,
  onChange: PropTypes.func,
};

UserInfoForm.defaultProps = {
  onChange: () => {},
};
