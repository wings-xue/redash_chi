import React from "react";
import PropTypes from "prop-types";
import BigMessage from "@/components/BigMessage";
import NoTaggedObjectsFound from "@/components/NoTaggedObjectsFound";
import EmptyState from "@/components/empty-state/EmptyState";

export default function QueriesListEmptyState({ page, searchTerm, selectedTags }) {
  if (searchTerm !== "") {
    return <BigMessage message="没有查询到任何记录。" icon="fa-search" />;
  }
  if (selectedTags.length > 0) {
    return <NoTaggedObjectsFound objectType="queries" tags={selectedTags} />;
  }
  switch (page) {
    case "favorites":
      return <BigMessage message="显示我关注的查询。" icon="fa-star" />;
    case "archive":
      return <BigMessage message="显示归档的查询。" icon="fa-archive" />;
    case "my":
      return (
        <div className="tiled bg-white p-15">
          <a href="queries/new" className="btn btn-primary btn-sm">
            新建查询
          </a>{" "}
          显示我的查询，若需帮助{" "}
          <a href="https://redash.io/help/user-guide/querying/writing-queries">查看帮助</a>.
        </div>
      );
    default:
      return (
        <EmptyState
          icon="fa fa-code"
          illustration="query"
          description="从数据源提取数据。"
          helpLink="https://help.redash.io/category/21-querying"
        />
      );
  }
}

QueriesListEmptyState.propTypes = {
  page: PropTypes.string.isRequired,
  searchTerm: PropTypes.string.isRequired,
  selectedTags: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};
