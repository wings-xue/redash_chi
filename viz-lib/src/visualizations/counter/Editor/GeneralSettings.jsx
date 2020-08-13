import { map } from "lodash";
import React from "react";
import { Section, Select, Input, InputNumber, Switch } from "@/components/visualizations/editor";
import { EditorPropTypes } from "@/visualizations/prop-types";

export default function GeneralSettings({ options, data, visualizationName, onOptionsChange }) {
  return (
    <React.Fragment>
      <Section>
        <Input
          layout="horizontal"
          label="计数器标题"
          data-test="Counter.General.Label"
          defaultValue={options.counterLabel}
          placeholder={visualizationName}
          onChange={e => onOptionsChange({ counterLabel: e.target.value })}
        />
      </Section>

      <Section>
        <Select
          layout="horizontal"
          label="计数器取值"
          data-test="Counter.General.ValueColumn"
          defaultValue={options.counterColName}
          disabled={options.countRow}
          onChange={counterColName => onOptionsChange({ counterColName })}>
          {map(data.columns, col => (
            <Select.Option key={col.name} data-test={"Counter.General.ValueColumn." + col.name}>
              {col.name}
            </Select.Option>
          ))}
        </Select>
      </Section>

      <Section>
        <InputNumber
          layout="horizontal"
          label="计数器行号"
          data-test="Counter.General.ValueRowNumber"
          defaultValue={options.rowNumber}
          disabled={options.countRow}
          onChange={rowNumber => onOptionsChange({ rowNumber })}
        />
      </Section>

      <Section>
        <Select
          layout="horizontal"
          label="目标值取值"
          data-test="Counter.General.TargetValueColumn"
          defaultValue={options.targetColName}
          onChange={targetColName => onOptionsChange({ targetColName })}>
          <Select.Option value="">无目标值</Select.Option>
          {map(data.columns, col => (
            <Select.Option key={col.name} data-test={"Counter.General.TargetValueColumn." + col.name}>
              {col.name}
            </Select.Option>
          ))}
        </Select>
      </Section>

      <Section>
        <InputNumber
          layout="horizontal"
          label="目标值行号"
          data-test="Counter.General.TargetValueRowNumber"
          defaultValue={options.targetRowNumber}
          onChange={targetRowNumber => onOptionsChange({ targetRowNumber })}
        />
      </Section>

      <Section>
        <Switch
          data-test="Counter.General.CountRows"
          defaultChecked={options.countRow}
          onChange={countRow => onOptionsChange({ countRow })}>
          统计行数
        </Switch>
      </Section>
    </React.Fragment>
  );
}

GeneralSettings.propTypes = EditorPropTypes;
