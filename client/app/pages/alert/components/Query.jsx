import React from "react";
import PropTypes from "prop-types";

import QuerySelector from "@/components/QuerySelector";
import SchedulePhrase from "@/components/queries/SchedulePhrase";
import { Query as QueryType } from "@/components/proptypes";

import Tooltip from "antd/lib/tooltip";
import Icon from "antd/lib/icon";

import "./Query.less";

export default function QueryFormItem({ query, queryResult, onChange, editMode }) {
  const queryHint =
    query && query.schedule ? (
      <small>
        Scheduled to refresh{" "}
        <i className="alert-query-schedule">
          <SchedulePhrase schedule={query.schedule} isNew={false} />
        </i>
      </small>
    ) : (
      <small>
        <Icon type="warning" theme="filled" className="warning-icon-danger" /> 该查询没有设置 <i>自动刷新</i>
        .{" "}
        <Tooltip title="要设置提醒，强烈建议使用自动刷新。对于不自动刷新的查询，仅在用户执行时发送一次提醒。">
          <a>
          强烈推荐 <Icon type="question-circle" theme="twoTone" />
          </a>
        </Tooltip>
      </small>
    );

  return (
    <>
      {editMode ? (
        <QuerySelector onChange={onChange} selectedQuery={query} className="alert-query-selector" type="select" />
      ) : (
        <Tooltip title="在新标签页中打开查询。">
          <a href={`queries/${query.id}`} target="_blank" rel="noopener noreferrer" className="alert-query-link">
            {query.name}
            <i className="fa fa-external-link" />
          </a>
        </Tooltip>
      )}
      <div className="ant-form-explain">{query && queryHint}</div>
      {query && !queryResult && (
        <div className="m-t-30">
          <Icon type="loading" className="m-r-5" /> 加载查询结果
        </div>
      )}
    </>
  );
}

QueryFormItem.propTypes = {
  query: QueryType,
  queryResult: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onChange: PropTypes.func,
  editMode: PropTypes.bool,
};

QueryFormItem.defaultProps = {
  query: null,
  queryResult: null,
  onChange: () => {},
  editMode: false,
};
