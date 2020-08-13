import createTabbedEditor from "@/components/visualizations/editor/createTabbedEditor";

import ColumnsSettings from "./ColumnsSettings";
import GridSettings from "./GridSettings";

import "./editor.less";

export default createTabbedEditor([
  { key: "Columns", title: "列设置", component: ColumnsSettings },
  { key: "Grid", title: "表格设置", component: GridSettings },
]);
