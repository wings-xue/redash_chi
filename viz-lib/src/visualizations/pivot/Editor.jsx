import { merge } from "lodash";
import React from "react";
import { Section, Switch } from "@/components/visualizations/editor";
import { EditorPropTypes } from "@/visualizations/prop-types";

export default function Editor({ options, onOptionsChange }) {
  const updateOptions = updates => {
    onOptionsChange(merge({}, options, updates));
  };

  return (
    <React.Fragment>
      <Section>
        <Switch
          data-test="PivotEditor.HideControls"
          id="pivot-show-controls"
          defaultChecked={!options.controls.enabled}
          onChange={enabled => updateOptions({ controls: { enabled: !enabled } })}>
          显示旋转控件
        </Switch>
      </Section>
      <Section>
        <Switch
          id="pivot-show-row-totals"
          defaultChecked={options.rendererOptions.table.rowTotals}
          onChange={rowTotals => updateOptions({ rendererOptions: { table: { rowTotals } } })}>
          显示行合计
        </Switch>
      </Section>
      <Section>
        <Switch
          id="pivot-show-column-totals"
          defaultChecked={options.rendererOptions.table.colTotals}
          onChange={colTotals => updateOptions({ rendererOptions: { table: { colTotals } } })}>
          显示列合计
        </Switch>
      </Section>
    </React.Fragment>
  );
}

Editor.propTypes = EditorPropTypes;
