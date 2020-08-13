import { map } from "lodash";
import React, { useMemo } from "react";
import { Select } from "@/components/visualizations/editor";
import { visualizationsSettings } from "@/visualizations/visualizationsSettings";

export default function ChartTypeSelect(props) {
  const chartTypes = useMemo(() => {
    const result = [
      { type: "line", name: "线形图(Line)", icon: "line-chart" },
      { type: "column", name: "条形图(Bar)", icon: "bar-chart" },
      { type: "area", name: "面积图(Area)", icon: "area-chart" },
      { type: "pie", name: "饼行图(Pie)", icon: "pie-chart" },
      { type: "scatter", name: "散点图(Scatter)", icon: "circle-o" },
      { type: "bubble", name: "气泡图(Bubble)", icon: "circle-o" },
      { type: "heatmap", name: "热力图(Heatmap)", icon: "th" },
      { type: "box", name: "箱行图(Box)", icon: "square-o" },
    ];

    if (visualizationsSettings.allowCustomJSVisualizations) {
      result.push({ type: "custom", name: "自定义(Custom)", icon: "code" });
    }

    return result;
  }, []);

  return (
    <Select {...props}>
      {map(chartTypes, ({ type, name, icon }) => (
        <Select.Option key={type} value={type} data-test={`Chart.ChartType.${type}`}>
          <i className={`fa fa-${icon}`} style={{ marginRight: 5 }} />
          {name}
        </Select.Option>
      ))}
    </Select>
  );
}
