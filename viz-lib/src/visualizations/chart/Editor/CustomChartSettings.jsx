import { isNil, trimStart } from "lodash";
import React from "react";
import { Section, Switch, TextArea } from "@/components/visualizations/editor";
import { EditorPropTypes } from "@/visualizations/prop-types";

const defaultCustomCode = trimStart(`
// Available variables are x, ys, element, and Plotly
// Type console.log(x, ys); for more info about x and ys
// To plot your graph call Plotly.plot(element, ...)
// Plotly examples and docs: https://plot.ly/javascript/
`);

export default function CustomChartSettings({ options, onOptionsChange }) {
  return (
    <React.Fragment>
      <Section>
        <TextArea
          label="自定义代码"
          data-test="Chart.Custom.Code"
          rows="10"
          defaultValue={isNil(options.customCode) ? defaultCustomCode : options.customCode}
          onChange={event => onOptionsChange({ customCode: event.target.value })}
        />
      </Section>

      <Section>
        <Switch
          data-test="Chart.Custom.EnableConsoleLogs"
          defaultChecked={options.enableConsoleLogs}
          onChange={enableConsoleLogs => onOptionsChange({ enableConsoleLogs })}>
          在终端显示错误
        </Switch>
      </Section>

      <Section>
        <Switch
          id="chart-editor-auto-update-custom-chart"
          data-test="Chart.Custom.AutoUpdate"
          defaultChecked={options.autoRedraw}
          onChange={autoRedraw => onOptionsChange({ autoRedraw })}>
          自动更新图表
        </Switch>
      </Section>
    </React.Fragment>
  );
}

CustomChartSettings.propTypes = EditorPropTypes;
