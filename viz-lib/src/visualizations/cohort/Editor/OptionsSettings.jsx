import { map } from "lodash";
import React from "react";
import { Section, Select } from "@/components/visualizations/editor";
import { EditorPropTypes } from "@/visualizations/prop-types";

const CohortTimeIntervals = {
  daily: "每日",
  weekly: "每周",
  monthly: "每月",
};

const CohortModes = {
  diagonal: "空值用0代替",
  simple: "原样显示",
};

export default function OptionsSettings({ options, onOptionsChange }) {
  return (
    <React.Fragment>
      <Section>
        <Select
          layout="horizontal"
          label="时间周期"
          data-test="Cohort.TimeInterval"
          value={options.timeInterval}
          onChange={timeInterval => onOptionsChange({ timeInterval })}>
          {map(CohortTimeIntervals, (name, value) => (
            <Select.Option key={value} data-test={"Cohort.TimeInterval." + value}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Section>

      <Section>
        <Select
          layout="horizontal"
          label="模式"
          data-test="Cohort.Mode"
          value={options.mode}
          onChange={mode => onOptionsChange({ mode })}>
          {map(CohortModes, (name, value) => (
            <Select.Option key={value} data-test={"Cohort.Mode." + value}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Section>
    </React.Fragment>
  );
}

OptionsSettings.propTypes = EditorPropTypes;
