import React from "react";
import { Section, Switch } from "@/components/visualizations/editor";
import { EditorPropTypes } from "@/visualizations/prop-types";

import AxisSettings from "./AxisSettings";

export default function XAxisSettings({ options, onOptionsChange }) {
  return (
    <React.Fragment>
      <AxisSettings
        id="XAxis"
        features={{ autoDetectType: true }}
        options={options.xAxis}
        onChange={xAxis => onOptionsChange({ xAxis })}
      />

      <Section>
        <Switch
          data-test="Chart.XAxis.Sort"
          defaultChecked={options.sortX}
          onChange={sortX => onOptionsChange({ sortX })}>
          排序
        </Switch>
      </Section>

      <Section>
        <Switch
          data-test="Chart.XAxis.Reverse"
          defaultChecked={options.reverseX}
          onChange={reverseX => onOptionsChange({ reverseX })}>
          升序/降序
        </Switch>
      </Section>

      <Section>
        <Switch
          data-test="Chart.XAxis.ShowLabels"
          defaultChecked={options.xAxis.labels.enabled}
          onChange={enabled => onOptionsChange({ xAxis: { labels: { enabled } } })}>
          显示标签
        </Switch>
      </Section>
    </React.Fragment>
  );
}

XAxisSettings.propTypes = EditorPropTypes;
