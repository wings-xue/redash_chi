import React from "react";
import { Section, Switch } from "@/components/visualizations/editor";
import { EditorPropTypes } from "@/visualizations/prop-types";

import AxisSettings from "./AxisSettings";

export default function YAxisSettings({ options, onOptionsChange }) {
  const [leftYAxis, rightYAxis] = options.yAxis;

  return (
    <React.Fragment>
      <Section.Title>左侧Y轴</Section.Title>

      <Section>
        <AxisSettings
          id="LeftYAxis"
          features={{ range: true }}
          options={leftYAxis}
          onChange={axis => onOptionsChange({ yAxis: [axis, rightYAxis] })}
        />
      </Section>

      {options.globalSeriesType !== "heatmap" && (
        <React.Fragment>
          <Section.Title>右侧Y轴</Section.Title>

          <Section>
            <AxisSettings
              id="RightYAxis"
              features={{ range: true }}
              options={rightYAxis}
              onChange={axis => onOptionsChange({ yAxis: [leftYAxis, axis] })}
            />
          </Section>
        </React.Fragment>
      )}

      {options.globalSeriesType === "heatmap" && (
        <React.Fragment>
          <Section>
            <Switch
              id="chart-editor-y-axis-sort"
              data-test="Chart.LeftYAxis.Sort"
              defaultChecked={options.sortY}
              onChange={sortY => onOptionsChange({ sortY })}>
              排序
            </Switch>
          </Section>

          <Section>
            <Switch
              id="chart-editor-y-axis-reverse"
              data-test="Chart.LeftYAxis.Reverse"
              defaultChecked={options.reverseY}
              onChange={reverseY => onOptionsChange({ reverseY })}>
              升序/降序
            </Switch>
          </Section>
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

YAxisSettings.propTypes = EditorPropTypes;
