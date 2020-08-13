import { map } from "lodash";
import React from "react";
import { Section, Select } from "@/components/visualizations/editor";
import { EditorPropTypes } from "@/visualizations/prop-types";

export default function ColumnsSettings({ options, data, onOptionsChange }) {
  return (
    <React.Fragment>
      <Section>
        <Select
          layout="horizontal"
          label="日期(时格)"
          data-test="Cohort.DateColumn"
          value={options.dateColumn}
          onChange={dateColumn => onOptionsChange({ dateColumn })}>
          {map(data.columns, ({ name }) => (
            <Select.Option key={name} data-test={"Cohort.DateColumn." + name}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Section>

      <Section>
        <Select
          layout="horizontal"
          label="层级"
          data-test="Cohort.StageColumn"
          value={options.stageColumn}
          onChange={stageColumn => onOptionsChange({ stageColumn })}>
          {map(data.columns, ({ name }) => (
            <Select.Option key={name} data-test={"Cohort.StageColumn." + name}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Section>

      <Section>
        <Select
          layout="horizontal"
          label="时格规模值"
          data-test="Cohort.TotalColumn"
          value={options.totalColumn}
          onChange={totalColumn => onOptionsChange({ totalColumn })}>
          {map(data.columns, ({ name }) => (
            <Select.Option key={name} data-test={"Cohort.TotalColumn." + name}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Section>

      <Section>
        <Select
          layout="horizontal"
          label="层级值"
          data-test="Cohort.ValueColumn"
          value={options.valueColumn}
          onChange={valueColumn => onOptionsChange({ valueColumn })}>
          {map(data.columns, ({ name }) => (
            <Select.Option key={name} data-test={"Cohort.ValueColumn." + name}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Section>
    </React.Fragment>
  );
}

ColumnsSettings.propTypes = EditorPropTypes;
