import React from "react";
import BigMessage from "@/components/BigMessage";

// Default "list empty" message for list pages
export default function EmptyState(props) {
  return (
    <div className="text-center">
      <BigMessage icon="fa-search" message="未能搜索到满足条件的内容！" {...props} />
    </div>
  );
}
