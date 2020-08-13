import React from "react";
import { useDebouncedCallback } from "use-debounce";
import { Section, Input, Checkbox, TextArea, ContextHelp } from "@/components/visualizations/editor";
import { EditorPropTypes } from "@/visualizations/prop-types";

function TemplateFormatHint() {
  // eslint-disable-line react/prop-types
  return (
    <ContextHelp placement="topLeft" arrowPointAtCenter>
      <div style={{ paddingBottom: 5 }}>
        所有查询结果列都可以按列名 <code>{"{{ column_name }}"}</code> 进行引用.
      </div>
      <div style={{ paddingBottom: 5 }}>内容为空将使用默认模板。</div>
    </ContextHelp>
  );
}

export default function FormatSettings({ options, onOptionsChange }) {
  const [onOptionsChangeDebounced] = useDebouncedCallback(onOptionsChange, 200);

  const templateFormatHint = <TemplateFormatHint />;

  return (
    <div className="map-visualization-editor-format-settings">
      <Section>
        <Checkbox
          data-test="Map.Editor.TooltipEnabled"
          checked={options.tooltip.enabled}
          onChange={event => onOptionsChange({ tooltip: { enabled: event.target.checked } })}>
          显示提示信息
        </Checkbox>
      </Section>

      <Section>
        <Input
          label={<React.Fragment>提示信息模板 {templateFormatHint}</React.Fragment>}
          data-test="Map.Editor.TooltipTemplate"
          disabled={!options.tooltip.enabled}
          placeholder="默认模板"
          defaultValue={options.tooltip.template}
          onChange={event => onOptionsChangeDebounced({ tooltip: { template: event.target.value } })}
        />
      </Section>

      <Section>
        <Checkbox
          data-test="Map.Editor.PopupEnabled"
          checked={options.popup.enabled}
          onChange={event => onOptionsChange({ popup: { enabled: event.target.checked } })}>
          显示弹出信息
        </Checkbox>
      </Section>

      <Section>
        <TextArea
          label={<React.Fragment>弹出信息模板 {templateFormatHint}</React.Fragment>}
          data-test="Map.Editor.PopupTemplate"
          disabled={!options.popup.enabled}
          rows={4}
          placeholder="默认模板"
          defaultValue={options.popup.template}
          onChange={event => onOptionsChangeDebounced({ popup: { template: event.target.value } })}
        />
      </Section>
    </div>
  );
}

FormatSettings.propTypes = EditorPropTypes;
